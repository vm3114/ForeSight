from rest_framework.decorators import api_view
from rest_framework.response import Response
from google.cloud import firestore
from firebase_init import db
from datetime import datetime
from dateutil.parser import parse
import numpy as np
import pickle
from .encounter_ai import predict_disease_from_features, load_model_from_pickle


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


@api_view(['POST'])
def create_diagnosis(request):
    data = request.data
    encounter_id = data.get("encounter_id")

    if not encounter_id:
        return Response({"error": "encounter_id is required"}, status=400)

    encounter_ref = db.collection("Encounters").document(encounter_id).get()
    if not encounter_ref.exists:
        return Response({"error": "Encounter not found"}, status=400)
    
    stats_ref = db.collection("Stats").document(encounter_id).get()
    if not stats_ref.exists:
        return Response({"error": "Stats not found"}, status=400)
    
    encounter_data = encounter_ref.to_dict()
    stats_data = stats_ref.to_dict()
    
    pain_severity = encounter_data.get("pain_severity")
    co2 = stats_data.get("co2")
    chloride = stats_data.get("chloride")
    weight = stats_data.get("weight")
    sodium = stats_data.get("sodium")
    creatinine = stats_data.get("creatinine")
    bmi = stats_data.get("bmi")
    calcium = stats_data.get("calcium")
    potassium = stats_data.get("potassium")
    tobacco_status = stats_data.get("tobacco_status")
    height = stats_data.get("height")
    bp_diastolic = stats_data.get("bp_diastolic")
    bp_systolic = stats_data.get("bp_systolic")
    heart_rate = stats_data.get("heart_rate")
    respiratory_rate = stats_data.get("respiratory_rate")

    stats_fields = [
        "pain_severity", "co2", "chloride", "weight", "sodium", "creatinine", "bmi", 
        "calcium", "potassium", "tobacco_status", "height", "bp_diastolic", 
        "bp_systolic", "heart_rate", "respiratory_rate"
    ]

    for field in stats_fields:
        if locals().get(field) is None:
            locals()[field] = np.nan

    model_path = "model_with_weights.pkl"
    loaded_model, loaded_encoder, loaded_weights = load_model_from_pickle(model_path)

    test_features = [
        co2, chloride, weight, sodium, creatinine, bmi, calcium, 
        potassium, tobacco_status, pain_severity, height, bp_diastolic, bp_systolic, heart_rate, respiratory_rate
    ]

    predicted_index, prob = predict_disease_from_features(loaded_model, *test_features)
    decoded_label = loaded_encoder.inverse_transform([predicted_index])[0]

    return Response({"message": "Diagnosis created successfully", "diagnosis": decoded_label, "probability": f"{prob:.4f}"})