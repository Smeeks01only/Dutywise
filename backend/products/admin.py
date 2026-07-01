from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from simple_history.admin import SimpleHistoryAdmin
from .models import Category, HSCode, Product

@admin.register(Category)
class CategoryAdmin(ImportExportModelAdmin, SimpleHistoryAdmin):
    list_display = ('name', 'slug', 'parent_category', 'status', 'is_active', 'created_at')
    search_fields = ('name', 'slug', 'description')
    list_filter = ('status', 'is_active')
    ordering = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    autocomplete_fields = ('parent_category',)

@admin.register(HSCode)
class HSCodeAdmin(ImportExportModelAdmin, SimpleHistoryAdmin):
    list_display = ('code', 'chapter', 'heading', 'status', 'version', 'is_active')
    search_fields = ('code', 'description', 'chapter', 'heading')
    list_filter = ('status', 'is_active', 'chapter')
    ordering = ('code',)
    autocomplete_fields = ('parent',)

@admin.register(Product)
class ProductAdmin(ImportExportModelAdmin, SimpleHistoryAdmin):
    list_display = ('name', 'category', 'hs_code', 'status', 'is_active')
    search_fields = ('name', 'description', 'keywords', 'hs_code__code')
    list_filter = ('status', 'is_active', 'category', 'default_country')
    autocomplete_fields = ('category', 'hs_code', 'default_country')
    ordering = ('name',)
