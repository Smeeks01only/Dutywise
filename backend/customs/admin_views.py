from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from core.models import Country, Currency
from products.models import Category, HSCode, Product
from tariffs.models import TariffRate, VATRule, ExciseRule, SurtaxRule, CarbonTaxRule, GovernmentFee, ImportRestriction
from customs.models import GovernmentAgency, TradeAgreement, DutyExemption, CustomsGlossaryTerm

from accounts.serializers import UserSerializer
from customs.serializers import (
    CountrySerializer, CurrencySerializer, CategorySerializer, HSCodeSerializer, ProductSerializer,
    GovernmentAgencySerializer, TariffRateSerializer, ImportRestrictionSerializer, TradeAgreementSerializer,
    CustomsGlossaryTermSerializer
)
from rest_framework import serializers

User = get_user_model()

# We need some serializers for the new rules we created
class VATRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = VATRule
        fields = '__all__'

class ExciseRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExciseRule
        fields = '__all__'

class SurtaxRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurtaxRule
        fields = '__all__'

class CarbonTaxRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarbonTaxRule
        fields = '__all__'

class GovernmentFeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GovernmentFee
        fields = '__all__'

class DutyExemptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DutyExemption
        fields = '__all__'


# ViewSets
class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]

class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]

class AdminHSCodeViewSet(viewsets.ModelViewSet):
    queryset = HSCode.objects.all()
    serializer_class = HSCodeSerializer
    permission_classes = [IsAdminUser]

class AdminTariffRateViewSet(viewsets.ModelViewSet):
    queryset = TariffRate.objects.all()
    serializer_class = TariffRateSerializer
    permission_classes = [IsAdminUser]

class AdminVATRuleViewSet(viewsets.ModelViewSet):
    queryset = VATRule.objects.all()
    serializer_class = VATRuleSerializer
    permission_classes = [IsAdminUser]

class AdminExciseRuleViewSet(viewsets.ModelViewSet):
    queryset = ExciseRule.objects.all()
    serializer_class = ExciseRuleSerializer
    permission_classes = [IsAdminUser]

class AdminSurtaxRuleViewSet(viewsets.ModelViewSet):
    queryset = SurtaxRule.objects.all()
    serializer_class = SurtaxRuleSerializer
    permission_classes = [IsAdminUser]

class AdminCarbonTaxRuleViewSet(viewsets.ModelViewSet):
    queryset = CarbonTaxRule.objects.all()
    serializer_class = CarbonTaxRuleSerializer
    permission_classes = [IsAdminUser]

class AdminGlossaryViewSet(viewsets.ModelViewSet):
    queryset = CustomsGlossaryTerm.objects.all()
    serializer_class = CustomsGlossaryTermSerializer
    permission_classes = [IsAdminUser]

class AdminRestrictionViewSet(viewsets.ModelViewSet):
    queryset = ImportRestriction.objects.all()
    serializer_class = ImportRestrictionSerializer
    permission_classes = [IsAdminUser]

class AdminAgencyViewSet(viewsets.ModelViewSet):
    queryset = GovernmentAgency.objects.all()
    serializer_class = GovernmentAgencySerializer
    permission_classes = [IsAdminUser]

class AdminAgreementViewSet(viewsets.ModelViewSet):
    queryset = TradeAgreement.objects.all()
    serializer_class = TradeAgreementSerializer
    permission_classes = [IsAdminUser]

from rest_framework.views import APIView
from rest_framework.response import Response

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({
            'users': User.objects.count(),
            'products': Product.objects.count(),
            'hscodes': HSCode.objects.count(),
            'tariff_rules': (
                TariffRate.objects.count() +
                VATRule.objects.count() +
                ExciseRule.objects.count() +
                SurtaxRule.objects.count() +
                CarbonTaxRule.objects.count()
            )
        })
