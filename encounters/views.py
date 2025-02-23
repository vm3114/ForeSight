from rest_framework.decorators import api_view
from rest_framework.response import Response
from google.cloud import firestore
from utils.firebase_init import db
from datetime import datetime
from dateutil.parser import parse


@api_view(['POST'])
def create_encounter(request):
    data = request.data

    email = data.get("email")
    if not email:
        return Response({"error": "email is required"}, status=400)
    user_ref = db.collection("users").document(email).get()
    if not user_ref.exists:
        return Response({"error": "incorrect email"}, status=400)
    
    user_data = user_ref.to_dict()
    patient_id = user_data.get("patient_id")
    start_date = data.get("start_date")  # Expecting ISO 8601 format (e.g., "2025-02-22T14:00:00Z")

    if not patient_id or not start_date:
        return Response({"error": "patient_id and start_date are required"}, status=400)

    try:
        start_date = parse(start_date)
    except ValueError:
        return Response({"error": "Invalid start_date format. Use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)."}, status=400)

    encounter_data = {
        "patient_id": patient_id,
        "pain_severity": data.get("pain_severity", 0),  # Default to 0 if not provided
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
        "co2": None,
        "chloride": None,
        "weight": None,
        "sodium": None,
        "creatinine": None,
        "bmi": None,
        "calcium": None,
        "potassium": None,
        "tobacco_status": None,
        "height": None,
        "bp_diastolic": None,
        "bp_systolic": None,
        "heart_rate": None,
        "respiratory_rate": None,
    }

    new_stats = {**default_stats, **{k: v for k, v in data.items() if k in default_stats}}
    new_stats["encounter_id"] = encounter_id

    stats_ref = db.collection("Stats").document(encounter_id)
    stats_ref.set(new_stats)

    return Response({"message": "Stats created successfully", "stats": new_stats})
