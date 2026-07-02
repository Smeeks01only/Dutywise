from django.db import models
from django.core.validators import RegexValidator
from core.models import UUIDMixin, TimestampMixin, SoftDeleteMixin
from core.models import Country
from simple_history.models import HistoricalRecords

class Category(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """
    Model representing a product category. Can be hierarchical.
    """
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255, unique=True, db_index=True, help_text="URL friendly string for the category")
    description = models.TextField(blank=True, null=True)
    parent_category = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='subcategories',
        help_text="The parent category if this is a subcategory"
    )
    icon = models.CharField(max_length=100, blank=True, null=True, help_text="Icon name or class (e.g. for Lucide icons)")
    status = models.CharField(max_length=20, choices=[('Active', 'Active'), ('Inactive', 'Inactive')], default='Active')

    history = HistoricalRecords()

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        if self.parent_category:
            return f"{self.parent_category.name} > {self.name}"
        return self.name


class HSCode(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """
    Model representing a Harmonized System Code for customs classification.
    """
    code = models.CharField(
        max_length=20, 
        unique=True, 
        db_index=True,
        validators=[RegexValidator(r'^\d{4}(\.\d{2})*$', 'HS Code must be standard numeric format, optionally separated by dots.')],
        help_text="Standard HS Code (e.g. 8703.23)"
    )
    description = models.TextField(help_text="Description of the goods covered by this HS code")
    section = models.CharField(max_length=255, blank=True, null=True, help_text="HS Section (Roman Numeral or Description)")
    chapter = models.CharField(max_length=5, blank=True, null=True, help_text="HS Chapter (first 2 digits)")
    heading = models.CharField(max_length=10, blank=True, null=True, help_text="HS Heading (first 4 digits)")
    subheading = models.CharField(max_length=15, blank=True, null=True, help_text="HS Subheading (first 6 digits)")
    notes = models.TextField(blank=True, null=True, help_text="Additional customs notes for this HS code")
    
    parent = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='children',
        help_text="Parent HS code if applicable (e.g. Heading for a Subheading)"
    )
    status = models.CharField(max_length=20, choices=[('Active', 'Active'), ('Inactive', 'Inactive'), ('Deprecated', 'Deprecated')], default='Active')
    effective_from = models.DateField(null=True, blank=True, help_text="Date when this HS code becomes effective")
    effective_to = models.DateField(null=True, blank=True, help_text="Date when this HS code expires")
    version = models.PositiveIntegerField(default=1, help_text="Version number of this HS Code entry")

    history = HistoricalRecords()

    class Meta:
        verbose_name = "HS Code"
        verbose_name_plural = "HS Codes"
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.description[:50]}"


class Product(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """
    Model representing a searchable product for duty calculation.
    """
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True, null=True)
    keywords = models.TextField(blank=True, null=True, help_text="Comma separated keywords for better searching")
    brand_names = models.TextField(blank=True, null=True, help_text="Comma separated brand names")
    alternative_names = models.TextField(blank=True, null=True, help_text="Comma separated alternative or colloquial names")
    search_weight = models.IntegerField(default=0, help_text="Higher weight products appear first in search")
    popularity_score = models.IntegerField(default=0, help_text="Number of times this product was searched/calculated")
    
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='products'
    )
    hs_code = models.ForeignKey(
        HSCode, 
        on_delete=models.PROTECT, 
        related_name='products',
        help_text="The classification HS code for this product"
    )
    default_country = models.ForeignKey(
        Country, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='default_products',
        help_text="Default country of origin if applicable"
    )
    status = models.CharField(max_length=20, choices=[('Active', 'Active'), ('Inactive', 'Inactive')], default='Active')
    image = models.ImageField(upload_to='products/', blank=True, null=True, help_text="Product image placeholder")
    typical_unit_value_usd = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    condition = models.CharField(max_length=50, blank=True, null=True)

    history = HistoricalRecords()

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
