from django.db import models
from core.models import UUIDMixin, TimestampMixin, SoftDeleteMixin, Currency

class ExchangeRate(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """
    Model representing an exchange rate between two currencies on a specific date.
    """
    base_currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='base_exchange_rates')
    target_currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='target_exchange_rates')
    
    exchange_rate = models.DecimalField(
        max_digits=18, 
        decimal_places=6, 
        help_text="The conversion rate multiplier from base to target currency"
    )
    source = models.CharField(max_length=100, blank=True, null=True, help_text="Source of the exchange rate data (e.g., RBZ)")
    date = models.DateField(db_index=True, help_text="The date this exchange rate was published or applies to")

    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['base_currency', 'target_currency', '-date']),
        ]

    def __str__(self):
        return f"1 {self.base_currency.code} = {self.exchange_rate} {self.target_currency.code} on {self.date}"
