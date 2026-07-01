from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CountryViewSet, CurrencyViewSet, CategoryViewSet, HSCodeViewSet,
    ProductViewSet, GovernmentAgencyViewSet, TariffRateViewSet,
    ImportRestrictionViewSet, TradeAgreementViewSet
)

router = DefaultRouter()
router.register(r'countries', CountryViewSet, basename='country')
router.register(r'currencies', CurrencyViewSet, basename='currency')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'hs-codes', HSCodeViewSet, basename='hscode')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'agencies', GovernmentAgencyViewSet, basename='agency')
router.register(r'tariffs', TariffRateViewSet, basename='tariffrate')
router.register(r'restrictions', ImportRestrictionViewSet, basename='restriction')
router.register(r'trade-agreements', TradeAgreementViewSet, basename='tradeagreement')

urlpatterns = [
    path('', include(router.urls)),
]
