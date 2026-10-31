import os
from datetime import datetime, timezone

import jwt
from rest_framework import authentication, exceptions


class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return None
        try:
            payload = jwt.decode(header[7:], os.getenv("JWT_SECRET", "change-me-jwt-in-production"), algorithms=["HS256"])
        except jwt.PyJWTError as exc:
            raise exceptions.AuthenticationFailed("Invalid or expired token") from exc
        if payload.get("exp", 0) < datetime.now(timezone.utc).timestamp():
            raise exceptions.AuthenticationFailed("Token expired")
        return (payload, payload)


def issue_token(user):
    now = datetime.now(timezone.utc)
    return jwt.encode({
        "sub": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "iat": now.timestamp(),
        "exp": now.timestamp() + int(os.getenv("JWT_EXPIRY_SECONDS", "86400")),
    }, os.getenv("JWT_SECRET", "change-me-jwt-in-production"), algorithm="HS256")
