from django.db import models
from django.conf import settings
from core.models import UUIDMixin, TimestampMixin, SoftDeleteMixin
from products.models import Product

class FavoriteProduct(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """
    Model representing a user's favorited product.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorite_products')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorited_by')

    class Meta:
        ordering = ['-created_at']
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.username}'s favorite: {self.product.name}"
