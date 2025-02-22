from rest_framework.response import Response
from rest_framework.decorators import api_view
from utils.auth_utils import decode_access_token


@api_view(['GET'])
def get_user_from_token(request):
    auth_header = request.headers.get("Authorization")

    if not auth_header or " " not in auth_header:
        return Response({"error": "Token required"}, status=401)

    token_type, token_value = auth_header.split(" ", 1)
    if token_type.lower() != "bearer":
        return Response({"error": "Invalid token format"}, status=401)

    email = decode_access_token(token_value)
    if isinstance(email, Response):
        return email

    return Response({"message": "Token decoded successfully", "email": email})
