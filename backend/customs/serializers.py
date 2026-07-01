from rest_framework import serializers
from core.models import Country, Currency
from products.models import Category, HSCode, Product
from tariffs.models import TariffRate, ImportRestriction
from customs.models import GovernmentAgency, TradeAgreement, DutyExemption

class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['id', 'name', 'iso_code', 'currency_code']


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ['id', 'code', 'name', 'symbol', 'decimal_places']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'parent_category', 'icon', 'status']


class HSCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HSCode
        fields = ['id', 'code', 'description', 'section', 'chapter', 'heading', 'subheading', 'notes', 'parent', 'status', 'effective_from', 'effective_to', 'version']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    hs_code_str = serializers.CharField(source='hs_code.code', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'keywords', 'category', 'category_name', 'hs_code', 'hs_code_str', 'default_country', 'status', 'image']


class GovernmentAgencySerializer(serializers.ModelSerializer):
    class Meta:
        model = GovernmentAgency
        fields = ['id', 'name', 'description', 'website', 'email', 'phone', 'address']


class TariffRateSerializer(serializers.ModelSerializer):
    hs_code_str = serializers.CharField(source='hs_code.code', read_only=True)
    country_iso = serializers.CharField(source='country.iso_code', read_only=True)
    
    class Meta:
        model = TariffRate
        fields = [
            'id', 'hs_code', 'hs_code_str', 'country', 'country_iso', 'trade_agreement',
            'tariff_type', 'percentage_rate', 'fixed_amount', 'calculation_basis',
            'effective_from', 'effective_to', 'status', 'legal_reference', 'notes',
            'version', 'is_current'
        ]


class ImportRestrictionSerializer(serializers.ModelSerializer):
    hs_code_str = serializers.CharField(source='hs_code.code', read_only=True)
    agency_name = serializers.CharField(source='government_agency.name', read_only=True)

    class Meta:
        model = ImportRestriction
        fields = [
            'id', 'hs_code', 'hs_code_str', 'restriction_type', 'description',
            'government_agency', 'agency_name', 'license_required', 'permit_required',
            'inspection_required', 'health_certificate', 'veterinary_certificate',
            'plant_permit', 'radiation_clearance', 'dangerous_goods', 'military_goods',
            'other_requirements', 'required_documents', 'reference_number', 'legal_citation'
        ]


class TradeAgreementSerializer(serializers.ModelSerializer):
    class Meta:
        model = TradeAgreement
        fields = ['id', 'name', 'countries_covered', 'eligibility_rules', 'required_certificate', 'effective_from', 'effective_to']
