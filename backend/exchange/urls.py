from django.urls import path
from .views import ExchangeRateListView

urlpatterns = [
    path('exchange-rates/', ExchangeRateListView.as_view(), name='exchange-rates'),
]
