from rest_framework import serializers
from .models import HSCode, TariffCategory

class HSCodeSearchSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = HSCode
        fields = [
            'code', 
            'name', 
            'category_name', 
            'duty_rate', 
            'vat_applicable', 
            'surtax_rate', 
            'excise_rate', 
            'is_duty_free'
        ]

class TariffCategorySerializer(serializers.ModelSerializer):
    hs_code_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = TariffCategory
        fields = ['name', 'slug', 'description', 'hs_code_count']
