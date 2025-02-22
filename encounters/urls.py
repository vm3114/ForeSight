from django.urls import path
from .views import create_encounter

urlpatterns = [
    path('create/', create_encounter, name="create_encounter"),
]
