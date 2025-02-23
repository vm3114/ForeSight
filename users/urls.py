from django.urls import path
from .views import *

urlpatterns = [
    path('register/', register_user, name="register"), #
    path('login/', login, name="login"),
    path('create_symptoms/', create_symptoms, name="create_symptoms"),
    path('user_data/', get_user_details_by_email, name="get_user_details_by_email"),
    path('test_endpoint/', test_endpoint, name="test_endpoint"),
    path('get_medical_history/<str:email>/', get_medical_history, name="get_medical_history"),
    path('update_medical_history/', update_medical_history, name="update_medical_history"),
    path('get_symptoms/<str:email>/', get_symptoms_by_email, name="get_symptoms"),
    path('get_medications/', get_medications, name="get_medications"),
    path('get_allergies/', get_allergies, name="get_allergies"),
    path('get_family_history/', get_family_history, name="get_family_history"),
    path('prevention/', prevention, name="get_prevention"),
]
