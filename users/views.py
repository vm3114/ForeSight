import jwt
import uuid
import os
from datetime import datetime, timedelta, timezone
from .auth import verify_password
from env import last_page, next_page, jinja2templates, jinja
from rest_framework.response import Response
from rest_framework.decorators import api_view
from firebase_admin import firestore
from utils.firebase_init import db
from .auth import hash_password
from .auth_middleware import SECRET_KEY, ALGORITHM
from prevention import *


ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

def create_access_token(email: str):
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


@api_view(['GET'])
def test_endpoint(request):
    return Response({"message": "User endpoint works"})


@api_view(['POST'])
def register_user(request):
    data = request.data

    user_ref = db.collection("users").where("Email", "==", data["Email"]).stream()
    if any(user_ref):
        return Response({"error": "Email already exists"}, status=400)

    data["Password"] = hash_password(data["Password"])
    patient_id = str(uuid.uuid4())
    data["patient_id"] = patient_id

    db.collection("users").document(data["Email"]).set(data)
    db.collection("Medical_History").document(patient_id).set({
        "patient_id": patient_id,
        "allergies": [],
        "current_medications": [],
        "family_medical_history": [],
        "past_medical_diagnoses": [],
    })

    access_token = create_access_token(data["Email"])
    return Response({
        "message": "User registered successfully",
        "patient_id": patient_id,
        "access_token": access_token,
        "token_type": "bearer"
    })


@api_view(['POST'])
def login(request):
    data = request.data
    user_ref = db.collection("users").document(data["Email"]).get()

    if not user_ref.exists:
        return Response({"error": "Invalid email"}, status=400)

    user = user_ref.to_dict()
    if not verify_password(data["Password"], user["Password"]):
        return Response({"error": "Invalid password"}, status=400)

    access_token = create_access_token(user["Email"])
    return Response({"access_token": access_token, "token_type": "bearer"})


@api_view(['GET'])
def get_medical_history(request, email):
    user_ref = db.collection("users").document(email).get()
    user_data = user_ref.to_dict()
    patient_id = user_data.get("patient_id")
    med_history_ref = db.collection("Medical_History").document(patient_id).get()

    if not med_history_ref.exists:
        return Response({"error": "Medical history not found"}, status=404)

    return Response({"medical_history": med_history_ref.to_dict()})


@api_view(['POST'])
def update_medical_history(request):
    data = request.data
    email = data.get("email")
    user_ref = db.collection("users").document(email).get()
    user_data = user_ref.to_dict()
    patient_id = user_data.get("patient_id")

    if not patient_id:
        return Response({"error": "patient_id is required"}, status=400)

    med_history_ref = db.collection("Medical_History").document(patient_id)
    med_history_doc = med_history_ref.get()

    if not med_history_doc.exists:
        return Response({"error": "Medical history not found"}, status=404)

    fields = ["allergies", "current_medications", "family_medical_history", "past_medical_diagnoses"]
    update_data = {}

    for field in fields:
        if field in data and isinstance(data[field], list):
            update_data[field] = data[field]

    if not update_data:
        return Response({"error": "No valid fields provided for update"}, status=400)

    med_history_ref.update(update_data)
    med_history_doc = db.collection("Medical_History").document(patient_id).get()
    return Response({"message": "Medical history updated successfully", "medical_history": med_history_doc.to_dict()})


@api_view(['POST'])
def create_symptoms(request):
    data = request.data
    email = data.get("email")
    if not email:
        return Response({"error": "email is required"}, status=400)
    user_ref = db.collection("users").document(email).get()
    if not user_ref.exists:
        return Response({"error": "incorrect email"}, status=400)
    
    user_data = user_ref.to_dict()
    patient_id = user_data.get("patient_id")
    symptom_fields = {
        "alcohol_consumption": None,
        "bp_diastolic": None,
        "bp_systolic": None,
        "cholesterol": None,
        "difficulty_walking": None,
        "does_smoke": None,
        "general_health": None,
        "glucose": None,
        "height": None,
        "physical_activity": None,
        "recent_stroke": None,
        "weight": None,
    }

    new_symptoms = {key: data.get(key, None) for key in symptom_fields}
    new_symptoms["patient_id"] = patient_id
    new_symptoms["age"] = user_data.get("Age") if user_data.get("Age") else None
    new_symptoms["gender"] = user_data.get("Gender") if user_data.get("Gender") else None

    db.collection("Symptoms").document(patient_id).delete()
    db.collection("Symptoms").document(patient_id).set(new_symptoms)
    return Response({"message": "Symptoms created successfully", "symptoms": new_symptoms})


@api_view(['GET'])
def get_symptoms_by_email(request, email):
    if not email:
        return Response({"error": "email is required"}, status=400)

    user_ref = db.collection("users").document(email).get()
    if not user_ref.exists:
        return Response({"error": "User not found"}, status=404)

    user_data = user_ref.to_dict()
    patient_id = user_data.get("patient_id")
    symptoms_ref = db.collection("Symptoms").document(patient_id).get()

    if not symptoms_ref.exists:
        return Response({"message": "No symptoms found", "symptoms": None})
    return Response({"message": "Symptoms retrieved successfully", "symptoms": symptoms_ref.to_dict()})


@api_view(['POST'])
def get_user_details_by_email(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "email is required"}, status=400)
    
    user_doc = db.collection("users").document(email).get()
    user_data = user_doc.to_dict()
    patient_id = user_data.get("patient_id")

    if not user_data:
        return Response({"error": "User not found"}, status=404)

    med_history_ref = db.collection("Medical_History").document(patient_id).get()
    med_history_data = med_history_ref.to_dict() if med_history_ref.exists else None

    return Response({
        "user_details": user_data,
        "medical_history": med_history_data if med_history_data else "No medical history found"
    })


@api_view(['POST'])
def get_family_history(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "email is required"}, status=400)
    
    user_doc = db.collection("users").document(email).get()
    user_data = user_doc.to_dict()
    patient_id = user_data.get("patient_id")

    med_history_ref = db.collection("Medical_History").document(patient_id).get()
    med_history_data = med_history_ref.to_dict() if med_history_ref.exists else None

    if not med_history_data:
        return Response({"error": "No medical history found"}, status=404)
    
    family_history = med_history_data.get("family_medical_history", None)
    return Response({"message": "success", "family_history": jinja2templates(family_history)})


@api_view(['POST'])
def get_medications(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "email is required"}, status=400)
    
    user_doc = db.collection("users").document(email).get()
    user_data = user_doc.to_dict()
    patient_id = user_data.get("patient_id")

    med_history_ref = db.collection("Medical_History").document(patient_id).get()
    med_history_data = med_history_ref.to_dict() if med_history_ref.exists else None

    if not med_history_data:
        return Response({"error": "No medical history found"}, status=404)
    
    prescribed = None
    medications = med_history_data.get("current_medications", None)
    return Response({"message": "success", "medications": jinja(medications, prescribed)})


@api_view(['POST'])
def get_allergies(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "email is required"}, status=400)
    
    user_doc = db.collection("users").document(email).get()
    user_data = user_doc.to_dict()
    patient_id = user_data.get("patient_id")

    med_history_ref = db.collection("Medical_History").document(patient_id).get()
    med_history_data = med_history_ref.to_dict() if med_history_ref.exists else None

    if not med_history_data:
        return Response({"error": "No medical history found"}, status=404)
    
    allergies = med_history_data.get("allergies", None)
    medications = med_history_data.get("current_medications", None)
    return Response({"message": "success", "allergies": next_page(medications, allergies)})


@api_view(['POST'])
def prevention(request):
    loaded_model = joblib.load("best_model.pkl")
    try:
        scaler = joblib.load("scaler.pkl")
    except:
        scaler = None  

    data = request.data
    email = data.get("email")
    if not email:
        return Response({"error": "email is required"}, status=400)
    
    user_doc = db.collection("users").document(email).get()
    user_data = user_doc.to_dict()
    patient_id = user_data.get("patient_id")
    age = user_data.get("Age")

    symptoms_ref = db.collection("Symptoms").document(patient_id).get()
    symptoms_data = symptoms_ref.to_dict() if symptoms_ref.exists else None
    ap_hi = symptoms_data.get("bp_systolic")
    ap_lo = symptoms_data.get("bp_diastolic")
    cholesterol = symptoms_data.get("cholesterol")
    gluc = symptoms_data.get("glucose")
    smoke = symptoms_data.get("does_smoke")
    active = symptoms_data.get("physical_activity")
    bmi = symptoms_data.get("weight") / (symptoms_data.get("height") / 100) ** 2

    if not any([ap_hi, ap_lo, cholesterol, gluc, smoke, active, bmi]):
        return Response({"error": "Not all parameters available."}, status=404)
    
    result, prob = predict_disease_from_features(loaded_model, scaler, age, ap_hi, ap_lo, cholesterol, gluc, smoke, active, bmi, threshold=0.3)
    final = f"Predicted Label: {result}, Probability: {prob:.4f}"
    return Response({"message": "success", "result": final})

