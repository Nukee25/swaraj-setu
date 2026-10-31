"""MongoDB document shapes used by the API.

The application intentionally uses PyMongo for atomic updates and geospatial
queries. These constants document the persisted schema without pretending that
MongoDB documents are relational Django models.
"""

USER_FIELDS = ("_id", "email", "name", "password_hash", "role", "created_at")
COMPLAINT_FIELDS = (
    "_id", "ticket_number", "title", "description", "location", "media",
    "primary_department", "secondary_departments", "urgency_level",
    "confidence_score", "status", "upvotes", "upvoted_by", "user_id",
    "created_at", "updated_at", "resolution_notes",
)
STATUS_LOG_FIELDS = ("_id", "complaint_id", "from_status", "to_status", "changed_by", "note", "created_at")
