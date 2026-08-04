from rest_framework import serializers
from .models import ExchangeRate

class ExchangeRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeRate
        fields = ['base_currency', 'target_currency', 'rate', 'fetched_at']
