from decimal import Decimal
from typing import List
from .schemas import CalculationRequest
from exchange_rates.models import ExchangeRate
from core.models import Currency

class ValidationError(Exception):
    def __init__(self, errors: List[str]):
        self.errors = errors
        super().__init__("Validation failed for Duty Calculation Engine")

class ValidationService:
    @staticmethod
    def validate_request(request: CalculationRequest):
        errors = []
        
        if not request.hs_code and not request.product:
            errors.append("Either a Product or an HS Code must be provided.")
            
        if request.product_value < 0:
            errors.append("Product value cannot be negative.")
            
        if request.quantity <= 0:
            errors.append("Quantity must be greater than zero.")
            
        if request.shipping_cost < 0:
            errors.append("Shipping cost cannot be negative.")
            
        if request.insurance_cost < 0:
            errors.append("Insurance cost cannot be negative.")
            
        if request.currency is None:
            errors.append("A valid currency must be provided.")
            
        if errors:
            raise ValidationError(errors)
            
    @staticmethod
    def resolve_exchange_rate(request: CalculationRequest) -> Decimal:
        """
        Resolves the exchange rate from the given currency to the base currency (USD).
        If the given currency is USD, the rate is 1.0.
        """
        if request.currency.code == 'USD':
            return Decimal('1.00')
            
        try:
            usd = Currency.objects.get(code='USD')
        except Currency.DoesNotExist:
            raise ValidationError(["Base currency 'USD' is not configured in the system."])
            
        # Try to find a rate where base is request.currency and target is USD
        rate_entry = ExchangeRate.objects.filter(
            base_currency=request.currency,
            target_currency=usd,
            date__lte=request.import_date
        ).first()
        
        if rate_entry:
            return rate_entry.exchange_rate
            
        # Try reverse rate: base is USD, target is request.currency
        reverse_rate_entry = ExchangeRate.objects.filter(
            base_currency=usd,
            target_currency=request.currency,
            date__lte=request.import_date
        ).first()
        
        if reverse_rate_entry and reverse_rate_entry.exchange_rate > 0:
            return Decimal('1.00') / reverse_rate_entry.exchange_rate
            
        raise ValidationError([f"No exchange rate found for {request.currency.code} to USD on or before {request.import_date}."])
