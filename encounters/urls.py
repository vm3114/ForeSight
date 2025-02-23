from django.urls import path
from .views import *

urlpatterns = [
    path('create/', create_encounter, name="create_encounter"),
    path('stats/', create_stats, name="create_stats"),
    path('diagnosis/', create_diagnosis, name="create_diagnosis"),
]
