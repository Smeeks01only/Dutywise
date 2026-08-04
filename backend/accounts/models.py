from django.db import models
from django.contrib.auth.models import User
from tariffs.models import HSCode

class SavedCalculation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_calculations')
    hs_code = models.ForeignKey(HSCode, on_delete=models.CASCADE)
    
    # Store the original request inputs (e.g., price, shipping, quantity, currency)
    input_snapshot = models.JSONField()
    
    # Store the full calculation result dict
    result_snapshot = models.JSONField()
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Calculation by {self.user.username} on {self.created_at.strftime('%Y-%m-%d')}"
