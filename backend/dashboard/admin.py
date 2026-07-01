from django.contrib import admin
from .models import FavoriteProduct

@admin.register(FavoriteProduct)
class FavoriteProductAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'created_at', 'is_active')
    search_fields = ('user__username', 'product__name')
    list_filter = ('is_active', 'created_at')
    autocomplete_fields = ('user', 'product')
    date_hierarchy = 'created_at'
    fieldsets = (
        ('Favorite Details', {
            'fields': ('user', 'product')
        }),
        ('Status', {
            'fields': ('is_active', 'deleted_at')
        }),
    )
