from django.contrib import admin
from .models import ExchangeRate

@admin.register(ExchangeRate)
class ExchangeRateAdmin(admin.ModelAdmin):
    list_display = ('base_currency', 'target_currency', 'exchange_rate', 'date', 'source', 'is_active')
    search_fields = ('base_currency__code', 'target_currency__code', 'source')
    list_filter = ('is_active', 'date', 'base_currency', 'target_currency')
    autocomplete_fields = ('base_currency', 'target_currency')
    date_hierarchy = 'date'
    ordering = ('-date',)
    fieldsets = (
        ('Currencies', {
            'fields': ('base_currency', 'target_currency')
        }),
        ('Rate Data', {
            'fields': ('exchange_rate', 'date', 'source')
        }),
        ('Status', {
            'fields': ('is_active', 'deleted_at')
        }),
    )
