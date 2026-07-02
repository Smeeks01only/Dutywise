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


from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomsGlossaryTerm(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """
    Dictionary of customs terminology for the explorer.
    """
    term = models.CharField(max_length=255, unique=True, db_index=True)
    definition = models.TextField()
    example = models.TextField(blank=True, null=True)
    related_terms = models.ManyToManyField('self', blank=True, symmetrical=True)

    history = HistoricalRecords()

    class Meta:
        ordering = ['term']
        verbose_name_plural = "Customs Glossary Terms"

    def __str__(self):
        return self.term

class UserBookmark(UUIDMixin, TimestampMixin):
    """
    Polymorphic bookmark model for users to save products, HS codes, etc.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    
    # Generic relation
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.CharField(max_length=36) # UUID is max 36 chars
    content_object = GenericForeignKey('content_type', 'object_id')

    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('user', 'content_type', 'object_id')

    def __str__(self):
        return f"{self.user.email} bookmarked {self.content_object}"

class RecentlyViewedItem(UUIDMixin, TimestampMixin):
    """
    Polymorphic recently viewed model.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recently_viewed')
    
    # Generic relation
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.CharField(max_length=36)
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        ordering = ['-updated_at'] # Updated when viewed again
        unique_together = ('user', 'content_type', 'object_id')

    def __str__(self):
        return f"{self.user.email} viewed {self.content_object}"
