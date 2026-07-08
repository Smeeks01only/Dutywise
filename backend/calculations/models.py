from django.db import models
from django.conf import settings
from core.models import UUIDMixin, TimestampMixin, SoftDeleteMixin, Country, Currency
from products.models import Product

class SavedCalculation(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """
    Model representing a saved duty and tax estimate calculation.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_calculations', null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='calculations')
    hs_code = models.ForeignKey('products.HSCode', on_delete=models.SET_NULL, null=True, blank=True, related_name='calculations')
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=True)
    currency = models.ForeignKey(Currency, on_delete=models.SET_NULL, null=True, blank=True)
    trade_agreement = models.ForeignKey('customs.TradeAgreement', on_delete=models.SET_NULL, null=True, blank=True)
    duty_exemption = models.ForeignKey('customs.DutyExemption', on_delete=models.SET_NULL, null=True, blank=True)
    
    product_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    insurance_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    quantity = models.PositiveIntegerField(default=1)
    
    exchange_rate_used = models.DecimalField(max_digits=18, decimal_places=6, default=1.0)
    
    total_customs_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_import_duty = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_vat = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_surtax = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_excise = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_carbon_tax = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    other_charges = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    grand_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    is_explicitly_saved = models.BooleanField(
        default=False, 
        help_text="True if the user explicitly saved this, False if it was auto-logged in history"
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        if self.product:
            return f"Calculation for {self.product.name} on {self.created_at.date()}"
        return f"Calculation on {self.created_at.date()}"


class ImportHistory(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """
    Model representing user's history of imports or calculations.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='import_history')
    saved_calculation = models.ForeignKey(SavedCalculation, on_delete=models.SET_NULL, null=True, blank=True, related_name='history_entries')
    notes = models.TextField(blank=True, null=True, help_text="User's personal notes on this import")

    class Meta:
        verbose_name_plural = "Import Histories"
        ordering = ['-created_at']

    def __str__(self):
        return f"History entry for {self.user.username} on {self.created_at.date()}"
