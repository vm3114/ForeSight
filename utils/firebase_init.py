import firebase_admin
import os
from firebase_admin import credentials, firestore

cred = credentials.Certificate("firebase_config.json")

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()
