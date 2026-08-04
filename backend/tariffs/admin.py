from django.contrib import admin
from .models import TariffCategory, HSCode, VATRate

@admin.register(TariffCategory)
class TariffCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'slug')

@admin.register(HSCode)
class HSCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'category', 'duty_rate', 'vat_applicable', 'is_duty_free')
    list_filter = ('category', 'vat_applicable', 'is_duty_free')
    search_fields = ('code', 'name', 'search_aliases')
    # Organized fieldsets for easier data entry
    fieldsets = (
        (None, {
            'fields': ('code', 'name', 'category', 'search_aliases')
        }),
        ('Rates', {
            'fields': ('duty_rate', 'vat_applicable', 'surtax_rate', 'excise_rate', 'is_duty_free')
        }),
    )

@admin.register(VATRate)
class VATRateAdmin(admin.ModelAdmin):
    list_display = ('rate', 'effective_from', 'effective_to')
    list_filter = ('effective_from', 'effective_to')
    ordering = ('-effective_from',)
