from django.urls import path
from .views import *

urlpatterns = [
    path('register/', register_user, name="register"), #
    path('login/', login, name="login"),
    path('crud_medical_history/', update_medical_history, name="update_medical_history"),
    path('crud_symptoms/', update_or_create_symptoms, name="crud_symptoms"),
    path('user_data/', get_user_details_by_email, name="get_user_details_by_email"),
    path('test_endpoint/', test_endpoint, name="test_endpoint"),
    path('get_medical_history/<str:email>/', get_medical_history, name="get_medical_history"),
    path('update_medical_history/', update_medical_history, name="update_medical_history"),
]
