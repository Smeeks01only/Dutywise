from django.db import models
from core.models import UUIDMixin, TimestampMixin, SoftDeleteMixin, Country
from simple_history.models import HistoricalRecords

class GovernmentAgency(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """
    Lookup table for Government Agencies involved in customs and imports.
    """
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    history = HistoricalRecords()

    class Meta:
        verbose_name_plural = "Government Agencies"
        ordering = ['name']

    def __str__(self):
        return self.name


class TradeAgreement(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """
    Preferential trade agreements that affect duty rates.
    """
    name = models.CharField(max_length=255, unique=True, help_text="e.g. SADC, COMESA, AfCFTA")
    countries_covered = models.ManyToManyField(Country, related_name='trade_agreements', blank=True)
    eligibility_rules = models.TextField(blank=True, null=True, help_text="Rules for qualifying for this agreement")
    required_certificate = models.CharField(max_length=255, blank=True, null=True, help_text="Required certificate of origin")
    effective_from = models.DateField(help_text="Date when agreement came into effect")
    effective_to = models.DateField(null=True, blank=True, help_text="Date when agreement expires (if applicable)")

    history = HistoricalRecords()

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class DutyExemption(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """
    Categories of goods or organizations exempt from certain duties.
    """
    name = models.CharField(max_length=255, unique=True, help_text="e.g. Diplomatic Imports, Medical Equipment")
    eligibility = models.TextField(help_text="Rules for who or what qualifies for this exemption")
    required_documentation = models.TextField(blank=True, null=True, help_text="Documents required to prove exemption status")
    approval_authority = models.ForeignKey(
        GovernmentAgency, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='duty_exemptions',
        help_text="Agency responsible for approving this exemption"
    )
    legal_basis = models.CharField(max_length=255, blank=True, null=True, help_text="Legal citation or statutory instrument")

    history = HistoricalRecords()

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
