from rest_framework import serializers
from decimal import Decimal
from core.models import Country, Currency
from products.models import Product, HSCode
from customs.models import TradeAgreement, DutyExemption
from .services.schemas import CalculationRequest
from .models import SavedCalculation

class CalculationEstimateRequestSerializer(serializers.Serializer):
    product_value = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.00'))
    quantity = serializers.IntegerField(min_value=1)
    shipping_cost = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.00'), default=Decimal('0.00'))
    insurance_cost = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.00'), default=Decimal('0.00'))
    
    currency_code = serializers.CharField(max_length=3)
    
    hs_code = serializers.CharField(max_length=20, required=False, allow_null=True, allow_blank=True)
    product_id = serializers.UUIDField(required=False, allow_null=True)
    
    country_iso = serializers.CharField(max_length=2, required=False, allow_null=True, allow_blank=True)
    trade_agreement_id = serializers.UUIDField(required=False, allow_null=True)
    duty_exemption_id = serializers.UUIDField(required=False, allow_null=True)
    
    def validate(self, attrs):
        if not attrs.get('hs_code') and not attrs.get('product_id'):
            raise serializers.ValidationError("Either hs_code or product_id must be provided.")
        return attrs
        
    def to_calculation_request(self) -> CalculationRequest:
        data = self.validated_data
        
        try:
            currency = Currency.objects.get(code=data['currency_code'])
        except Currency.DoesNotExist:
            raise serializers.ValidationError({"currency_code": "Invalid currency code."})
            
        hs_code_obj = None
        if data.get('hs_code'):
            try:
                hs_code_obj = HSCode.objects.get(code=data['hs_code'], is_active=True)
            except HSCode.DoesNotExist:
                raise serializers.ValidationError({"hs_code": "HS Code not found or inactive."})
                
        product_obj = None
        if data.get('product_id'):
            try:
                product_obj = Product.objects.get(id=data['product_id'], is_active=True)
            except Product.DoesNotExist:
                raise serializers.ValidationError({"product_id": "Product not found or inactive."})
                
        country_obj = None
        if data.get('country_iso'):
            try:
                country_obj = Country.objects.get(iso_code=data['country_iso'])
            except Country.DoesNotExist:
                pass
                
        agreement_obj = None
        if data.get('trade_agreement_id'):
            try:
                agreement_obj = TradeAgreement.objects.get(id=data['trade_agreement_id'])
            except TradeAgreement.DoesNotExist:
                pass
                
        exemption_obj = None
        if data.get('duty_exemption_id'):
            try:
                exemption_obj = DutyExemption.objects.get(id=data['duty_exemption_id'])
            except DutyExemption.DoesNotExist:
                pass
                
        return CalculationRequest(
            product_value=data['product_value'],
            quantity=data['quantity'],
            shipping_cost=data.get('shipping_cost', Decimal('0.00')),
            insurance_cost=data.get('insurance_cost', Decimal('0.00')),
            currency=currency,
            hs_code=hs_code_obj,
            product=product_obj,
            country_of_origin=country_obj,
            trade_agreement=agreement_obj,
            duty_exemption=exemption_obj
        )

class SavedCalculationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedCalculation
        fields = '__all__'
