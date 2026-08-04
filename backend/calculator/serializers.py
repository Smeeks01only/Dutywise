from rest_framework import serializers
from decimal import Decimal

class CalculateDutySerializer(serializers.Serializer):
    SUPPORTED_CURRENCIES = ['USD', 'ZWG', 'ZAR', 'GBP']

    hs_code = serializers.CharField(max_length=20)
    product_price = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.00'))
    shipping_cost = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.00'))
    insurance = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.00'))
    quantity = serializers.IntegerField(min_value=1, default=1)
    currency = serializers.ChoiceField(choices=SUPPORTED_CURRENCIES)
