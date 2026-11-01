import os
from functools import lru_cache

from pymongo import ASCENDING, GEOSPHERE, MongoClient


@lru_cache(maxsize=1)
def get_client():
    return MongoClient(os.getenv("MONGODB_URI", "mongodb://localhost:27017/swaraj_setu"), serverSelectionTimeoutMS=5000)


def get_db():
    return get_client()[os.getenv("MONGODB_NAME", "swaraj_setu")]


def ensure_indexes():
    db = get_db()
    db.complaints.create_index([("location", GEOSPHERE)])
    db.complaints.create_index([("ticket_number", ASCENDING)], unique=True)
    db.complaints.create_index([("status", ASCENDING), ("primary_department", ASCENDING)])
    db.status_logs.create_index([("complaint_id", ASCENDING), ("created_at", ASCENDING)])
    db.users.create_index([("email", ASCENDING)], unique=True)
