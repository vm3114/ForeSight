import firebase_admin
import json
from firebase_admin import credentials, firestore

# Initialize Firestore
cred = credentials.Certificate("firebase_config.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Load JSON file
json_file = "mapping.json"
with open(json_file, "r") as f:
    data = json.load(f)

# Ensure Firestore stores lists inside dictionaries
if isinstance(data, dict):
    for key, value in data.items():
        if isinstance(value, list):
            value = {"items": value}  # Wrap list inside a dictionary
        db.collection("Disease").document(str(key)).set(value)
elif isinstance(data, list):
    for index, value in enumerate(data):
        if isinstance(value, list):
            value = {"items": value}  # Wrap list inside a dictionary
        db.collection("Disease").document(str(index)).set(value)
else:
    print("Error: JSON data is neither a dictionary nor a list.")
