from rest_framework.decorators import api_view
from rest_framework.response import Response
from google.cloud import firestore
from datetime import datetime
from utils.firebase_init import db

@api_view(['POST'])
def create_encounter(request):
    data = request.data

    patient_id = data.get("patient_id")
    start_date = data.get("start_date")  # Expecting ISO 8601 format (e.g., "2025-02-22T14:00:00Z")

    if not patient_id or not start_date:
        return Response({"error": "patient_id and start_date are required"}, status=400)

    try:
        start_date = datetime.fromisoformat(start_date)
    except ValueError:
        return Response({"error": "Invalid start_date format. Use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)."}, status=400)

    encounter_data = {
        "patient_id": patient_id,
        "pain_severity": data.get("pain_severity", 0),  # Default to 0 if not provided
        "reason_code": data.get("reason_code", ""),
        "reason_desc": data.get("reason_desc", ""),
        "start_date": start_date,
    }

    encounter_ref = db.collection("Encounters").add(encounter_data)
    return Response({"message": "Encounter created successfully", "encounter_id": encounter_ref[1].id})


@api_view(['POST'])
def create_stats(request):
    data = request.data
    encounter_id = data.get("encounter_id")

    if not encounter_id:
        return Response({"error": "encounter_id is required"}, status=400)

    default_stats = {
        "bmi": None,
        "body_temp": None,
        "bp": None,
        "cholesterol": None,
        "co2": None,
        "general_health": None,
        "glucose": None,
        "height": None,
        "respiratory_rate": None,
        "weight": None
    }

    new_stats = {**default_stats, **{k: v for k, v in data.items() if k in default_stats}}
    new_stats["encounter_id"] = encounter_id

    stats_ref = db.collection("Stats").document(encounter_id)
    stats_ref.set(new_stats)

    return Response({"message": "Stats created successfully", "stats": new_stats})


["weight", "bp_systolic", "bp_diastolic", "respiratory_rate", "tobacco", "co2", "glucose", "nitrogen",
  "creatinine", "calcium", "sodium", "bmi", "heart_rate", "height"]