from django.db import models

class TariffCategory(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Tariff Categories"

    def __str__(self):
        return self.name

class HSCode(models.Model):
    code = models.CharField(max_length=20, db_index=True)
    # Serves as both the official name and searchable product name (e.g. "Smartphones")
    name = models.CharField(max_length=255, db_index=True)
    category = models.ForeignKey(TariffCategory, on_delete=models.CASCADE, related_name="hs_codes")
    
    # Financial/percentage data using DecimalField
    duty_rate = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage e.g., 15.00 for 15%")
    vat_applicable = models.BooleanField(default=True)
    surtax_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    excise_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_duty_free = models.BooleanField(default=False)
    
    # Text field for simple comma-separated search aliases
    search_aliases = models.CharField(max_length=512, blank=True, help_text='Comma-separated alternative names (e.g., "iPhone, cellphone")')

    class Meta:
        verbose_name_plural = "HS Codes"

    def __str__(self):
        return f"{self.code} - {self.name}"

class VATRate(models.Model):
    # Allows tracking VAT changes over time without modifying HSCode records
    rate = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage e.g., 15.00 for 15%")
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True, help_text="Leave blank if this is the currently active rate")

    class Meta:
        verbose_name = "VAT Rate"
        verbose_name_plural = "VAT Rates"

    def __str__(self):
        status = "Active" if not self.effective_to else f"Ends {self.effective_to}"
        return f"{self.rate}% (From: {self.effective_from} - {status})"
