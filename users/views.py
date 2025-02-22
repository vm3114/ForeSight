import jwt
import uuid
import os
from datetime import datetime, timedelta, timezone
from .auth import verify_password
from rest_framework.response import Response
from rest_framework.decorators import api_view
from firebase_admin import firestore
from utils.firebase_init import db
from .auth import hash_password
from .auth_middleware import SECRET_KEY, ALGORITHM


ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

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
        "surgical_history": []
    })

    return Response({"message": "User registered successfully", "patient_id": data["patient_id"]})


def create_access_token(email: str):
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


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


@api_view(['POST'])
def update_medical_history(request):
    data = request.data
    patient_id = data.get("patient_id")

    if not patient_id:
        return Response({"error": "patient_id is required"}, status=400)

    med_history_ref = db.collection("Medical_History").document(patient_id)
    med_history_doc = med_history_ref.get()

    if not med_history_doc.exists:
        return Response({"error": "Medical history not found"}, status=404)

    fields = ["allergies", "current_medications", "family_medical_history", "past_medical_diagnoses", "surgical_history"]
    update_data = {}

    for field in fields:
        if field in data and isinstance(data[field], list):
            update_data[field] = firestore.ArrayUnion(data[field])

    if not update_data:
        return Response({"error": "No valid fields provided for update"}, status=400)

    med_history_ref.update(update_data)
    updated_doc = med_history_ref.get().to_dict()

    return Response({
        "message": "Medical history updated successfully",
        "updated_fields": {key: updated_doc[key] for key in update_data}
    })


@api_view(['POST'])
def update_or_create_symptoms(request):
    data = request.data
    patient_id = data.get("patient_id")

    if not patient_id:
        return Response({"error": "patient_id is required"}, status=400)

    symptoms_ref = db.collection("Symptoms").document(patient_id)
    symptoms_doc = symptoms_ref.get()

    default_symptoms = {
        "alcohol_consumption": False,
        "bmi": 24.5,
        "bp_diastolic": 80,
        "bp_systolic": 120,
        "cholesterol": 0,
        "difficulty_walking": False,
        "does_smoke": False,
        "general_health": 5,
        "glucose": 0,
        "physical_activity": True,
        "recent_stroke": False
    }

    if symptoms_doc.exists:
        update_data = {key: value for key, value in data.items() if key in default_symptoms}
        if not update_data:
            return Response({"error": "No valid fields provided for update"}, status=400)
        symptoms_ref.update(update_data)
        return Response({"message": "Symptoms updated successfully", "updated_fields": update_data})

    new_symptoms = {**default_symptoms, **data}
    symptoms_ref.set(new_symptoms)

    return Response({"message": "Symptoms record created successfully", "symptoms": new_symptoms})


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
