from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from simple_history.admin import SimpleHistoryAdmin
from .models import TariffRate, ImportRestriction

@admin.register(TariffRate)
class TariffRateAdmin(ImportExportModelAdmin, SimpleHistoryAdmin):
    list_display = ('hs_code', 'tariff_type', 'percentage_rate', 'fixed_amount', 'effective_from', 'status', 'version', 'is_current')
    search_fields = ('hs_code__code', 'legal_reference')
    list_filter = ('tariff_type', 'status', 'is_current', 'effective_from')
    autocomplete_fields = ('hs_code', 'country', 'trade_agreement')
    date_hierarchy = 'effective_from'

    def has_delete_permission(self, request, obj=None):
        if obj and not obj.is_current:
            return False  # Protect history
        return super().has_delete_permission(request, obj)

@admin.register(ImportRestriction)
class ImportRestrictionAdmin(ImportExportModelAdmin, SimpleHistoryAdmin):
    list_display = ('hs_code', 'restriction_type', 'government_agency', 'is_active')
    search_fields = ('description', 'hs_code__code', 'reference_number')
    list_filter = ('restriction_type', 'government_agency', 'license_required', 'permit_required', 'is_active')
    autocomplete_fields = ('hs_code', 'government_agency')
