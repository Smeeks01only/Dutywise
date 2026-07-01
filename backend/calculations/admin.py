from django.contrib import admin
from .models import SavedCalculation, ImportHistory

@admin.register(SavedCalculation)
class SavedCalculationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'product', 'country', 'grand_total', 'created_at', 'is_active')
    search_fields = ('user__username', 'product__name', 'country__name')
    list_filter = ('is_active', 'created_at', 'country', 'currency')
    autocomplete_fields = ('user', 'product', 'country', 'currency')
    date_hierarchy = 'created_at'
    fieldsets = (
        ('Context', {
            'fields': ('user', 'product', 'country', 'currency')
        }),
        ('Input Values', {
            'fields': ('product_price', 'shipping_cost', 'insurance_cost', 'quantity', 'exchange_rate_used')
        }),
        ('Calculated Totals', {
            'fields': ('total_customs_value', 'total_import_duty', 'total_vat', 'total_surtax', 'total_excise', 'total_carbon_tax', 'other_charges', 'grand_total')
        }),
        ('Status', {
            'fields': ('is_active', 'deleted_at')
        }),
    )

@admin.register(ImportHistory)
class ImportHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'saved_calculation', 'created_at', 'is_active')
    search_fields = ('user__username', 'notes')
    list_filter = ('is_active', 'created_at')
    autocomplete_fields = ('user', 'saved_calculation')
    date_hierarchy = 'created_at'
    fieldsets = (
        ('History Details', {
            'fields': ('user', 'saved_calculation', 'notes')
        }),
        ('Status', {
            'fields': ('is_active', 'deleted_at')
        }),
    )
