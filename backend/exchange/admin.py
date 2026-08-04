from django.contrib import admin
from .models import ExchangeRate

@admin.register(ExchangeRate)
class ExchangeRateAdmin(admin.ModelAdmin):
    list_display = ('base_currency', 'target_currency', 'rate', 'fetched_at')
    list_filter = ('target_currency', 'fetched_at')
    search_fields = ('target_currency',)
    date_hierarchy = 'fetched_at'
