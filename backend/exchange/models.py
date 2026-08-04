from django.db import models

class ExchangeRate(models.Model):
    BASE_CURRENCIES = [
        ('USD', 'US Dollar'),
    ]
    
    TARGET_CURRENCIES = [
        ('ZWG', 'Zimbabwe Gold'),
        ('ZAR', 'South African Rand'),
        ('GBP', 'British Pound'),
    ]

    base_currency = models.CharField(max_length=3, choices=BASE_CURRENCIES, default='USD')
    target_currency = models.CharField(max_length=3, choices=TARGET_CURRENCIES)
    # Using DecimalField with 6 decimal places for high precision currency conversion
    rate = models.DecimalField(max_digits=12, decimal_places=6)
    fetched_at = models.DateTimeField()

    class Meta:
        ordering = ['-fetched_at']

    def __str__(self):
        return f"1 {self.base_currency} = {self.rate} {self.target_currency} ({self.fetched_at.strftime('%Y-%m-%d %H:%M')})"
