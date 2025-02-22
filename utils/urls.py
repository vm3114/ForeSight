from django.urls import path
from .views import *

urlpatterns = [
    path('decode_user/', get_user_from_token, name="get_user_from_token"), 
]
