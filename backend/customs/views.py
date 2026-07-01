from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from core.models import Country, Currency
from products.models import Category, HSCode, Product
from tariffs.models import TariffRate, ImportRestriction
from customs.models import GovernmentAgency, TradeAgreement
from .serializers import (
    CountrySerializer, CurrencySerializer, CategorySerializer, HSCodeSerializer,
    ProductSerializer, GovernmentAgencySerializer, TariffRateSerializer,
    ImportRestrictionSerializer, TradeAgreementSerializer
)

class BaseReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Base viewset to provide consistent filtering and search.
    """
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]


class CountryViewSet(BaseReadOnlyViewSet):
    queryset = Country.objects.filter(is_active=True)
    serializer_class = CountrySerializer
    search_fields = ['name', 'iso_code', 'currency_code']
    ordering_fields = ['name', 'iso_code']


class CurrencyViewSet(BaseReadOnlyViewSet):
    queryset = Currency.objects.filter(is_active=True)
    serializer_class = CurrencySerializer
    search_fields = ['name', 'code']
    ordering_fields = ['code', 'name']


class CategoryViewSet(BaseReadOnlyViewSet):
    queryset = Category.objects.filter(is_active=True, status='Active')
    serializer_class = CategorySerializer
    search_fields = ['name', 'description']
    filterset_fields = ['parent_category', 'status']
    ordering_fields = ['name']


class HSCodeViewSet(BaseReadOnlyViewSet):
    queryset = HSCode.objects.filter(is_active=True)
    serializer_class = HSCodeSerializer
    search_fields = ['code', 'description', 'chapter', 'heading']
    filterset_fields = ['chapter', 'heading', 'status', 'parent']
    ordering_fields = ['code']


class ProductViewSet(BaseReadOnlyViewSet):
    queryset = Product.objects.filter(is_active=True, status='Active').select_related('category', 'hs_code', 'default_country')
    serializer_class = ProductSerializer
    search_fields = ['name', 'description', 'keywords', 'hs_code__code']
    filterset_fields = ['category', 'default_country', 'hs_code']
    ordering_fields = ['name']


class GovernmentAgencyViewSet(BaseReadOnlyViewSet):
    queryset = GovernmentAgency.objects.filter(is_active=True)
    serializer_class = GovernmentAgencySerializer
    search_fields = ['name', 'description']
    ordering_fields = ['name']


class TariffRateViewSet(BaseReadOnlyViewSet):
    queryset = TariffRate.objects.filter(is_active=True, is_current=True).select_related('hs_code', 'country', 'trade_agreement')
    serializer_class = TariffRateSerializer
    search_fields = ['hs_code__code', 'legal_reference']
    filterset_fields = ['hs_code', 'country', 'tariff_type', 'trade_agreement']
    ordering_fields = ['effective_from', 'percentage_rate']


class ImportRestrictionViewSet(BaseReadOnlyViewSet):
    queryset = ImportRestriction.objects.filter(is_active=True).select_related('hs_code', 'government_agency')
    serializer_class = ImportRestrictionSerializer
    search_fields = ['description', 'hs_code__code', 'reference_number']
    filterset_fields = ['hs_code', 'restriction_type', 'government_agency', 'license_required', 'permit_required']
    ordering_fields = ['hs_code__code']


class TradeAgreementViewSet(BaseReadOnlyViewSet):
    queryset = TradeAgreement.objects.filter(is_active=True).prefetch_related('countries_covered')
    serializer_class = TradeAgreementSerializer
    search_fields = ['name', 'eligibility_rules']
    filterset_fields = ['countries_covered']
    ordering_fields = ['name']
