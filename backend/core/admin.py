from django.contrib import admin
from .models import Country, Currency

@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'symbol', 'is_active', 'created_at')
    search_fields = ('code', 'name')
    list_filter = ('is_active',)
    ordering = ('code',)
    fieldsets = (
        ('Currency Details', {
            'fields': ('code', 'name', 'symbol', 'decimal_places')
        }),
        ('Status', {
            'fields': ('is_active', 'deleted_at')
        }),
    )

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'iso_code', 'currency_code', 'is_active', 'created_at')
    search_fields = ('name', 'iso_code', 'currency_code')
    list_filter = ('is_active',)
    ordering = ('name',)
    fieldsets = (
        ('Country Details', {
            'fields': ('name', 'iso_code', 'currency_code')
        }),
        ('Status', {
            'fields': ('is_active', 'deleted_at')
        }),
    )
