import hashlib
from datetime import datetime, timezone

from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from pymongo import ReturnDocument
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .authentication import issue_token
from .db import get_db
from .ollama_client import classify_complaint
from .serializers import ComplaintCreateSerializer, SignupSerializer, SmartPreviewSerializer, StatusSerializer


def _jsonable(document):
    if not document:
        return None
    result = dict(document)
    result["id"] = str(result.pop("_id"))
    if isinstance(result.get("created_at"), datetime):
        result["created_at"] = result["created_at"].isoformat()
    if isinstance(result.get("updated_at"), datetime):
        result["updated_at"] = result["updated_at"].isoformat()
    result.pop("upvoted_by", None)
    return result


def _user_id(request):
    return request.auth.get("sub") if request.auth else None


class HealthView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            get_db().command("ping")
            return Response({"status": "ok", "database": "ok"})
        except Exception as exc:
            return Response({"status": "degraded", "database": str(exc)}, status=503)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        password = str(request.data.get("password", ""))
        user = get_db().users.find_one({"email": email})
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        if not user or user.get("password_hash") != password_hash:
            return Response({"detail": "Invalid credentials"}, status=401)
        return Response({"token": issue_token(user), "user": {
            "id": str(user["_id"]), "email": user["email"], "name": user["name"], "role": user["role"],
        }})


class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        email = data["email"].strip().lower()
        now = datetime.now(timezone.utc)
        user = {
            "email": email,
            "name": data["name"].strip(),
            "password_hash": hashlib.sha256(data["password"].encode()).hexdigest(),
            "role": "public",
            "created_at": now,
        }
        try:
            created = get_db().users.insert_one(user)
        except DuplicateKeyError:
            return Response({"detail": "An account with this email already exists"}, status=409)
        user["_id"] = created.inserted_id
        return Response({"token": issue_token(user), "user": {
            "id": str(user["_id"]), "email": user["email"], "name": user["name"], "role": user["role"],
        }}, status=201)


class ProfileView(APIView):
    def get(self, request):
        if not request.auth:
            return Response({"detail": "Authentication required"}, status=401)
        user_id = _user_id(request)
        db = get_db()
        user = db.users.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
        if not user:
            return Response({"detail": "User not found"}, status=404)
        raised = list(db.complaints.find({"user_id": user_id}).sort("created_at", -1))
        upvote_count = db.complaints.count_documents({"upvoted_by": user_id})
        return Response({
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
            },
            "stats": {
                "raised_complaints": len(raised),
                "upvoted_complaints": upvote_count,
                "civic_score": len(raised) + upvote_count,
            },
            "complaints": [_jsonable(item) for item in raised],
        })


class SmartPreviewView(APIView):
    def post(self, request):
        serializer = SmartPreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(classify_complaint(serializer.validated_data["text"]))


class ComplaintCreateView(APIView):
    def post(self, request):
        serializer = ComplaintCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        classification = data.get("classification") or classify_complaint(data["description"])
        now = datetime.now(timezone.utc)
        sequence = get_db().counters.find_one_and_update(
            {"_id": "complaints"}, {"$inc": {"value": 1}}, upsert=True, return_document=ReturnDocument.AFTER,
        )["value"]
        document = {
            "ticket_number": f"SS-{now.year}-{sequence:05d}",
            "title": data["title"],
            "description": data["description"],
            "location": {"type": "Point", "coordinates": [data["location"]["lng"], data["location"]["lat"]]},
            "media": data.get("media", []),
            **classification,
            "status": "Pending",
            "upvotes": 0,
            "upvoted_by": [],
            "user_id": _user_id(request),
            "created_at": now,
            "updated_at": now,
            "resolution_notes": "",
        }
        created = get_db().complaints.insert_one(document)
        return Response(_jsonable(get_db().complaints.find_one({"_id": created.inserted_id})), status=201)


class ComplaintFeedView(APIView):
    def get(self, request):
        try:
            lat, lng, radius = float(request.query_params["lat"]), float(request.query_params["lng"]), float(request.query_params.get("radius", 5000))
            query = {"location": {"$near": {"$geometry": {"type": "Point", "coordinates": [lng, lat]}, "$maxDistance": radius}}}
        except (KeyError, TypeError, ValueError):
            query = {}
        limit = min(int(request.query_params.get("limit", 50)), 100)
        return Response([_jsonable(item) for item in get_db().complaints.find(query).sort("created_at", -1).limit(limit)])


class UpvoteView(APIView):
    def post(self, request, complaint_id):
        if not request.auth:
            return Response({"detail": "Authentication required"}, status=401)
        user_id = _user_id(request)
        try:
            object_id = ObjectId(complaint_id)
        except Exception:
            return Response({"detail": "Invalid complaint id"}, status=400)
        updated = get_db().complaints.find_one_and_update(
            {"_id": object_id, "upvoted_by": {"$ne": user_id}},
            {"$inc": {"upvotes": 1}, "$addToSet": {"upvoted_by": user_id}, "$set": {"updated_at": datetime.now(timezone.utc)}},
            return_document=ReturnDocument.AFTER,
        )
        if not updated:
            current = get_db().complaints.find_one({"_id": object_id}, {"upvotes": 1, "upvoted_by": 1})
            if not current:
                return Response({"detail": "Complaint not found"}, status=404)
            if user_id in current.get("upvoted_by", []):
                return Response({"id": complaint_id, "upvotes": current.get("upvotes", 0), "already_upvoted": True})
            return Response({"detail": "Unable to record upvote"}, status=409)
        return Response({"id": complaint_id, "upvotes": updated["upvotes"], "already_upvoted": False})


class StatusUpdateView(APIView):
    def patch(self, request, complaint_id):
        if not request.auth or request.auth.get("role") != "admin":
            return Response({"detail": "Administrator role required"}, status=403)
        serializer = StatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            object_id = ObjectId(complaint_id)
        except Exception:
            return Response({"detail": "Invalid complaint id"}, status=400)
        current = get_db().complaints.find_one({"_id": object_id})
        if not current:
            return Response({"detail": "Complaint not found"}, status=404)
        new_status = serializer.validated_data["status"]
        allowed = {
            "Pending": {"Assigned"},
            "Assigned": {"In Progress"},
            "In Progress": {"Resolved"},
            "Resolved": set(),
        }
        if new_status != current["status"] and new_status not in allowed.get(current["status"], set()):
            return Response({"detail": f"Invalid lifecycle transition from {current['status']} to {new_status}"}, status=400)
        resolution_notes = serializer.validated_data.get("resolution_notes", "").strip()
        if new_status == "Resolved" and not resolution_notes:
            return Response({"detail": "Resolution proof notes are required before closure"}, status=400)
        now = datetime.now(timezone.utc)
        updated = get_db().complaints.find_one_and_update(
            {"_id": object_id}, {"$set": {"status": new_status, "resolution_notes": resolution_notes, "updated_at": now}}, return_document=ReturnDocument.AFTER,
        )
        get_db().status_logs.insert_one({
            "complaint_id": complaint_id, "from_status": current["status"], "to_status": new_status,
            "changed_by": _user_id(request), "note": resolution_notes, "created_at": now,
        })
        return Response(_jsonable(updated))
