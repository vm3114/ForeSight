from django.http import JsonResponse
import jwt
from utils.firebase_init import db
from dotenv import load_dotenv
import os


load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

def authenticate_request(get_response):
    def middleware(request):
        if request.path in ["/user/register/", "/user/login/", "/user/test_endpoint/"]:
            return get_response(request)
        
        token = request.headers.get("Authorization")
        if not token:
            return JsonResponse({"error": "Authentication token required"}, status=401)

        try:
            payload = jwt.decode(token.split(" ")[1], SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            user_ref = db.collection("users").document(email).get()
            if not user_ref.exists:
                return JsonResponse({"error": "User not found"}, status=401)
            request.user = user_ref.to_dict()
        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Token expired"}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "Invalid token"}, status=401)

        return get_response(request)
    return middleware
