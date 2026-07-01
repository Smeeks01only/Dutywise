from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from simple_history.admin import SimpleHistoryAdmin
from .models import GovernmentAgency, TradeAgreement, DutyExemption

@admin.register(GovernmentAgency)
class GovernmentAgencyAdmin(ImportExportModelAdmin, SimpleHistoryAdmin):
    list_display = ('name', 'website', 'email', 'phone', 'is_active')
    search_fields = ('name', 'description', 'email')
    list_filter = ('is_active',)

@admin.register(TradeAgreement)
class TradeAgreementAdmin(ImportExportModelAdmin, SimpleHistoryAdmin):
    list_display = ('name', 'effective_from', 'effective_to', 'is_active')
    search_fields = ('name', 'eligibility_rules')
    list_filter = ('is_active',)
    autocomplete_fields = ('countries_covered',)

@admin.register(DutyExemption)
class DutyExemptionAdmin(ImportExportModelAdmin, SimpleHistoryAdmin):
    list_display = ('name', 'approval_authority', 'is_active')
    search_fields = ('name', 'eligibility', 'legal_basis')
    list_filter = ('is_active', 'approval_authority')
    autocomplete_fields = ('approval_authority',)
