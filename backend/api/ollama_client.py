import json
import re

import requests
from django.conf import settings

DEPARTMENTS = [
    "Water Supply", "Electricity", "Roads & Transport", "Sanitation",
    "Healthcare", "Education", "Public Safety", "Tax & Revenue",
    "Building & Construction", "Environment",
]
URGENCY_LEVELS = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}


def _fallback(text):
    lower = text.lower()
    keywords = {
        "water": "Water Supply", "tap": "Water Supply", "electric": "Electricity",
        "light": "Electricity", "pothole": "Roads & Transport", "road": "Roads & Transport",
        "garbage": "Sanitation", "waste": "Sanitation", "drain": "Sanitation",
        "hospital": "Healthcare", "school": "Education", "police": "Public Safety",
        "tax": "Tax & Revenue", "construction": "Building & Construction",
        "pollution": "Environment", "noise": "Environment",
    }
    department = next((value for key, value in keywords.items() if key in lower), "Sanitation")
    urgency = "CRITICAL" if any(word in lower for word in ("death", "fire", "danger", "emergency")) else "MEDIUM"
    return {"primary_department": department, "secondary_departments": [], "urgency_level": urgency, "confidence_score": 0.45}


def classify_complaint(text):
    prompt = f"""You classify civic complaints. Return ONLY valid JSON, with no markdown:
{{"primary_department":"one of {DEPARTMENTS}","secondary_departments":["zero or more departments"],"urgency_level":"LOW|MEDIUM|HIGH|CRITICAL","confidence_score":0.0}}
Complaint: {text}"""
    try:
        response = requests.post(
            f"{settings.OLLAMA_HOST}/api/generate",
            json={"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": False, "format": "json"},
            timeout=45,
        )
        response.raise_for_status()
        raw = response.json().get("response", "")
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        data = json.loads(match.group(0) if match else raw)
        primary = data.get("primary_department")
        urgency = data.get("urgency_level")
        if primary not in DEPARTMENTS or urgency not in URGENCY_LEVELS:
            raise ValueError("Invalid model classification")
        return {
            "primary_department": primary,
            "secondary_departments": [item for item in data.get("secondary_departments", []) if item in DEPARTMENTS and item != primary][:5],
            "urgency_level": urgency,
            "confidence_score": max(0.0, min(1.0, float(data.get("confidence_score", 0.0)))),
        }
    except (requests.RequestException, ValueError, TypeError, json.JSONDecodeError):
        return _fallback(text)
