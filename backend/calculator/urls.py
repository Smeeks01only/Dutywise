from django.urls import path
from .views import CalculateDutyView

urlpatterns = [
    path('calculate/', CalculateDutyView.as_view(), name='calculate-duty'),
]
