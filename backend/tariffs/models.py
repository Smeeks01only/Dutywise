from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import UUIDMixin, TimestampMixin, SoftDeleteMixin, Country
from products.models import HSCode, Category
from customs.models import TradeAgreement, GovernmentAgency
from simple_history.models import HistoricalRecords
from decimal import Decimal

class TariffRate(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """
    Stores customs rates mapped to HS Codes and Countries.
    Supports versions so history is never overwritten.
    """
    class TariffType(models.TextChoices):
        IMPORT_DUTY = 'IMPORT_DUTY', 'Import Duty'
        VAT = 'VAT', 'Value Added Tax'
        EXCISE = 'EXCISE', 'Excise Duty'
        SURTAX = 'SURTAX', 'Surtax'
        CARBON_TAX = 'CARBON_TAX', 'Carbon Tax'
        PROCESSING_FEE = 'PROCESSING_FEE', 'Processing Fee'
        OTHER = 'OTHER', 'Other Government Charge'
        
    class CalculationBasis(models.TextChoices):
        PERCENTAGE = 'PERCENTAGE', 'Percentage'
        FOB = 'FOB', 'Free On Board Value'
        CIF = 'CIF', 'Cost, Insurance, Freight Value'
        WEIGHT = 'WEIGHT', 'Per Kg/Tonne'
        VOLUME = 'VOLUME', 'Per Liter/M3'
        QUANTITY = 'QUANTITY', 'Per Item/Unit'
        FLAT_FEE = 'FLAT_FEE', 'Flat Fee'

    hs_code = models.ForeignKey(HSCode, on_delete=models.CASCADE, related_name='tariff_rates')
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='tariff_rates', null=True, blank=True, help_text="Specific Country of Origin (leave blank if global)")
    trade_agreement = models.ForeignKey(TradeAgreement, on_delete=models.SET_NULL, null=True, blank=True, related_name='tariff_rates')
    
    tariff_type = models.CharField(max_length=50, choices=TariffType.choices, default=TariffType.IMPORT_DUTY)
    
    percentage_rate = models.DecimalField(
        max_digits=7, 
        decimal_places=3, 
        validators=[MinValueValidator(Decimal('0.00'))],
        null=True, blank=True,
        help_text="Percentage rate (0-100+)"
    )
    fixed_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        null=True, blank=True,
        help_text="Fixed monetary amount"
    )
    calculation_basis = models.CharField(max_length=50, choices=CalculationBasis.choices, default=CalculationBasis.PERCENTAGE)
    
    effective_from = models.DateField(help_text="Date when these rates become effective")
    effective_to = models.DateField(null=True, blank=True, help_text="Date when these rates expire (leave blank if indefinite)")
    status = models.CharField(max_length=20, choices=[('Active', 'Active'), ('Inactive', 'Inactive')], default='Active')
    
    legal_reference = models.CharField(max_length=255, blank=True, null=True, help_text="Statutory Instrument or Legal Citation")
    notes = models.TextField(blank=True, null=True)

    # Versioning
    version = models.PositiveIntegerField(default=1)
    previous_version = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='next_versions')
    is_current = models.BooleanField(default=True, help_text="Is this the current active version?")

    history = HistoricalRecords()

    class Meta:
        ordering = ['-effective_from']
        indexes = [
            models.Index(fields=['hs_code', 'country']),
            models.Index(fields=['hs_code', 'tariff_type']),
        ]

    def __str__(self):
        return f"{self.get_tariff_type_display()} for {self.hs_code.code} (v{self.version})"


class ImportRestriction(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """
    Stores import regulations and restrictions for specific HS Codes.
    """
    class RestrictionType(models.TextChoices):
        ALLOWED = 'ALLOWED', 'Allowed'
        RESTRICTED = 'RESTRICTED', 'Restricted'
        PROHIBITED = 'PROHIBITED', 'Prohibited'
        
    hs_code = models.ForeignKey(HSCode, on_delete=models.CASCADE, related_name='import_restrictions')
    restriction_type = models.CharField(max_length=20, choices=RestrictionType.choices, default=RestrictionType.RESTRICTED)
    description = models.TextField(help_text="Detailed explanation of the restriction")
    
    government_agency = models.ForeignKey(GovernmentAgency, on_delete=models.SET_NULL, null=True, blank=True, related_name='restrictions')
    
    # Flags
    license_required = models.BooleanField(default=False)
    permit_required = models.BooleanField(default=False)
    inspection_required = models.BooleanField(default=False)
    health_certificate = models.BooleanField(default=False)
    veterinary_certificate = models.BooleanField(default=False)
    plant_permit = models.BooleanField(default=False)
    radiation_clearance = models.BooleanField(default=False)
    dangerous_goods = models.BooleanField(default=False)
    military_goods = models.BooleanField(default=False)
    other_requirements = models.BooleanField(default=False)
    
    required_documents = models.TextField(blank=True, null=True, help_text="Comma separated list of required documents")
    reference_number = models.CharField(max_length=100, blank=True, null=True, help_text="Internal or agency reference number")
    legal_citation = models.CharField(max_length=255, blank=True, null=True, help_text="Legal basis for the restriction")

    history = HistoricalRecords()

    class Meta:
        ordering = ['hs_code__code']

    def __str__(self):
        return f"{self.get_restriction_type_display()} - {self.hs_code.code}"

class VATRule(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    hs_code = models.ForeignKey(HSCode, on_delete=models.CASCADE, related_name='vat_rules')
    vat_rate_percent = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('15.00'))
    is_zero_rated = models.BooleanField(default=False)
    is_exempt = models.BooleanField(default=False)
    exemption_reason = models.TextField(blank=True, null=True)
    legal_reference = models.CharField(max_length=255, blank=True, null=True)
    
    history = HistoricalRecords()

    def __str__(self):
        return f"VAT Rule for {self.hs_code.code}"


class ExciseRule(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    hs_code = models.ForeignKey(HSCode, on_delete=models.CASCADE, related_name='excise_rules')
    excise_type = models.CharField(max_length=50) # Specific, Ad Valorem, Compound
    rate_percent = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    specific_amount_usd = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    specific_unit = models.CharField(max_length=50, blank=True, null=True)
    legal_reference = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    history = HistoricalRecords()

    def __str__(self):
        return f"Excise Rule for {self.hs_code.code}"


class SurtaxRule(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    applies_to_category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='surtax_rules')
    vehicle_type = models.CharField(max_length=100, blank=True, null=True)
    min_age_years = models.IntegerField(blank=True, null=True)
    max_age_years = models.IntegerField(blank=True, null=True)
    surtax_rate_percent = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    calculated_on = models.CharField(max_length=100, blank=True, null=True)
    legal_reference = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    history = HistoricalRecords()

    def __str__(self):
        return f"Surtax Rule for {self.applies_to_category.name}"


class CarbonTaxRule(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    applies_to_category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='carbon_tax_rules')
    engine_capacity_min_cc = models.IntegerField(blank=True, null=True)
    engine_capacity_max_cc = models.IntegerField(blank=True, null=True)
    carbon_tax_amount_usd = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    billing_frequency = models.CharField(max_length=100, blank=True, null=True)
    legal_reference = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    history = HistoricalRecords()

    def __str__(self):
        return f"Carbon Tax for {self.applies_to_category.name}"


class GovernmentFee(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    fee_name = models.CharField(max_length=255)
    applicable_to = models.CharField(max_length=255, blank=True, null=True)
    fee_basis = models.CharField(max_length=255, blank=True, null=True)
    amount_usd = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    amount_percent = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    agency = models.ForeignKey(GovernmentAgency, on_delete=models.SET_NULL, null=True, blank=True)
    legal_reference = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    history = HistoricalRecords()

    def __str__(self):
        return self.fee_name

