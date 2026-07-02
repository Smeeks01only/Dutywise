from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .admin_views import (
    AdminUserViewSet, AdminProductViewSet, AdminCategoryViewSet, AdminHSCodeViewSet,
    AdminTariffRateViewSet, AdminVATRuleViewSet, AdminExciseRuleViewSet,
    AdminSurtaxRuleViewSet, AdminCarbonTaxRuleViewSet, AdminStatsView,
    AdminGlossaryViewSet, AdminRestrictionViewSet, AdminAgencyViewSet, AdminAgreementViewSet
)

router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='admin-users')
router.register(r'products', AdminProductViewSet, basename='admin-products')
router.register(r'categories', AdminCategoryViewSet, basename='admin-categories')
router.register(r'hscodes', AdminHSCodeViewSet, basename='admin-hscodes')
router.register(r'tariffs', AdminTariffRateViewSet, basename='admin-tariffs')
router.register(r'vat-rules', AdminVATRuleViewSet, basename='admin-vat-rules')
router.register(r'excise-rules', AdminExciseRuleViewSet, basename='admin-excise-rules')
router.register(r'surtax-rules', AdminSurtaxRuleViewSet, basename='admin-surtax-rules')
router.register(r'carbon-tax-rules', AdminCarbonTaxRuleViewSet, basename='admin-carbon-tax-rules')
router.register(r'glossary', AdminGlossaryViewSet, basename='admin-glossary')
router.register(r'restrictions', AdminRestrictionViewSet, basename='admin-restrictions')
router.register(r'agencies', AdminAgencyViewSet, basename='admin-agencies')
router.register(r'agreements', AdminAgreementViewSet, basename='admin-agreements')

urlpatterns = [
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('', include(router.urls)),
]
