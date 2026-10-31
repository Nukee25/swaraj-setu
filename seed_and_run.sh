#!/usr/bin/env bash
set -euo pipefail

docker compose up -d --build
until docker compose exec -T mongodb mongosh --quiet --username root --password "${MONGO_INITDB_ROOT_PASSWORD:-swaraj-mongo-password}" --authenticationDatabase admin --eval "db.adminCommand('ping').ok" >/dev/null 2>&1; do
  sleep 2
done

docker exec swaraj-ollama-nlp ollama pull "${OLLAMA_MODEL:-llama3.2}"
docker compose exec -T mongodb mongosh --quiet --username root --password "${MONGO_INITDB_ROOT_PASSWORD:-swaraj-mongo-password}" --authenticationDatabase admin swaraj_setu --eval 'db.complaints.createIndex({location:"2dsphere"}); db.complaints.createIndex({ticket_number:1},{unique:true})'

docker compose exec -T backend-django python - <<'PY'
import hashlib
from datetime import datetime, timezone
from api.db import get_db

db = get_db()
db.users.update_one({"email": "citizen@swarajsetu.local"}, {"$setOnInsert": {
    "email": "citizen@swarajsetu.local", "name": "Demo Citizen",
    "password_hash": hashlib.sha256(b"demo1234").hexdigest(), "role": "public",
    "created_at": datetime.now(timezone.utc),
}}, upsert=True)
db.users.update_one({"email": "admin@swarajsetu.local"}, {"$setOnInsert": {
    "email": "admin@swarajsetu.local", "name": "Municipal Admin",
    "password_hash": hashlib.sha256(b"admin1234").hexdigest(), "role": "admin",
    "created_at": datetime.now(timezone.utc),
}}, upsert=True)
if db.complaints.count_documents({}) == 0:
    cities = [
        ("Pothole near Connaught Place", "Large pothole is damaging vehicles near the inner circle.", 28.6315, 77.2167, "Roads & Transport"),
        ("Water outage in Dwarka", "No water supply for three days in Sector 10.", 28.5921, 77.0460, "Water Supply"),
        ("Streetlights out in Noida", "Four streetlights are not working near the market.", 28.5355, 77.3910, "Electricity"),
        ("Garbage accumulation in Rohini", "Waste has not been collected for a week.", 28.7495, 77.0565, "Sanitation"),
        ("Drain overflow in Gurugram", "Sewage is overflowing onto the service road.", 28.4595, 77.0266, "Sanitation"),
        ("Broken footpath in Saket", "The footpath is unsafe for wheelchair users.", 28.5244, 77.2066, "Roads & Transport"),
        ("Air pollution near school", "Heavy dust from construction is affecting students.", 28.6139, 77.2090, "Environment"),
        ("Clinic medicine shortage", "The local clinic has run out of essential medicines.", 28.5672, 77.3219, "Healthcare"),
        ("Illegal construction", "Construction blocks the public access lane.", 28.7041, 77.1025, "Building & Construction"),
        ("Traffic signal failure", "Signal is not working at a busy junction.", 28.6692, 77.4538, "Public Safety"),
    ]
    now = datetime.now(timezone.utc)
    for index, (title, description, lat, lng, department) in enumerate(cities, 1):
        db.complaints.insert_one({
            "ticket_number": f"SS-2026-{index:05d}", "title": title, "description": description,
            "location": {"type": "Point", "coordinates": [lng, lat]}, "media": [],
            "primary_department": department, "secondary_departments": [], "urgency_level": "MEDIUM",
            "confidence_score": 0.96, "status": "Pending", "upvotes": 0, "upvoted_by": [],
            "user_id": None, "created_at": now, "updated_at": now, "resolution_notes": "",
        })
    db.counters.update_one({"_id": "complaints"}, {"$max": {"value": 10}}, upsert=True)
print("Seed complete")
PY

echo "Swaraj Setu is available at http://localhost/"
