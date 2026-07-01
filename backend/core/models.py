import uuid
from django.db import models
from django.core.validators import MinLengthValidator, RegexValidator

class UUIDMixin(models.Model):
    """
    Mixin that adds a UUID primary key to models.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class TimestampMixin(models.Model):
    """
    Mixin that adds created_at and updated_at timestamp fields.
    """
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SoftDeleteMixin(models.Model):
    """
    Mixin that adds soft delete capability with an is_active boolean and deleted_at timestamp.
    """
    is_active = models.BooleanField(default=True, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True

    def delete(self, *args, **kwargs):
        from django.utils import timezone
        self.is_active = False
        self.deleted_at = timezone.now()
        self.save()


class Currency(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """
    Model representing a global currency.
    """
    code = models.CharField(
        max_length=3,
        unique=True,
        validators=[MinLengthValidator(3), RegexValidator(r'^[A-Z]{3}$', 'Currency code must be 3 uppercase letters.')],
        help_text="3-letter ISO currency code (e.g. USD)"
    )
    name = models.CharField(max_length=100, help_text="Full name of the currency")
    symbol = models.CharField(max_length=10, help_text="Currency symbol (e.g. $)")
    decimal_places = models.PositiveSmallIntegerField(default=2, help_text="Number of decimal places used")

    class Meta:
        verbose_name_plural = "Currencies"
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"


class Country(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """
    Model representing a country.
    """
    name = models.CharField(max_length=100, unique=True, db_index=True)
    iso_code = models.CharField(
        max_length=2,
        unique=True,
        validators=[MinLengthValidator(2), RegexValidator(r'^[A-Z]{2}$', 'ISO code must be 2 uppercase letters.')],
        help_text="2-letter ISO 3166-1 alpha-2 country code (e.g. ZW)"
    )
    currency_code = models.CharField(
        max_length=3,
        validators=[MinLengthValidator(3), RegexValidator(r'^[A-Z]{3}$', 'Currency code must be 3 uppercase letters.')],
        help_text="Default 3-letter currency code for this country",
        blank=True,
        null=True
    )

    class Meta:
        verbose_name_plural = "Countries"
        ordering = ['name']

    def __str__(self):
        return self.name
