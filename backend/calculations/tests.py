from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from django.contrib.auth import get_user_model
from core.models import Country, Currency
from products.models import HSCode, Product, Category
from tariffs.models import TariffRate
from customs.models import TradeAgreement, DutyExemption
from .services.calculation_engine import DutyCalculationEngine
from .services.schemas import CalculationRequest
from .models import SavedCalculation

User = get_user_model()

class DutyCalculationEngineTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", email="test@test.com", password="password")
        
        # Setup currencies
        self.usd = Currency.objects.create(code="USD", name="US Dollar", symbol="$")
        self.zar = Currency.objects.create(code="ZAR", name="South African Rand", symbol="R")
        
        # Setup country
        self.sa = Country.objects.create(name="South Africa", iso_code="ZA", currency_code="ZAR")
        
        # Setup HS Code
        self.hs_code = HSCode.objects.create(code="8703.23.00", description="Motor Vehicles")
        
        # Setup Trade Agreement & Exemption
        self.sadc = TradeAgreement.objects.create(name="SADC", effective_from="2020-01-01")
        self.diplomat_exemption = DutyExemption.objects.create(name="Diplomatic")
        
        # Setup Tariffs
        # Base Duty: 40%
        TariffRate.objects.create(
            hs_code=self.hs_code, 
            tariff_type='IMPORT_DUTY', 
            percentage_rate=Decimal('40.00'), 
            effective_from="2020-01-01"
        )
        
        # SADC Duty: 10%
        TariffRate.objects.create(
            hs_code=self.hs_code, 
            country=self.sa,
            trade_agreement=self.sadc,
            tariff_type='IMPORT_DUTY', 
            percentage_rate=Decimal('10.00'), 
            effective_from="2020-01-01"
        )
        
        # Excise: 5%
        TariffRate.objects.create(
            hs_code=self.hs_code, 
            tariff_type='EXCISE', 
            percentage_rate=Decimal('5.00'), 
            effective_from="2020-01-01"
        )
        
        # Surtax: 10%
        TariffRate.objects.create(
            hs_code=self.hs_code, 
            tariff_type='SURTAX', 
            percentage_rate=Decimal('10.00'), 
            effective_from="2020-01-01"
        )
        
        # VAT: 15%
        TariffRate.objects.create(
            hs_code=self.hs_code, 
            tariff_type='VAT', 
            percentage_rate=Decimal('15.00'), 
            effective_from="2020-01-01"
        )

    def test_engine_standard_calculation(self):
        req = CalculationRequest(
            product_value=Decimal('10000.00'),
            quantity=1,
            shipping_cost=Decimal('1000.00'),
            insurance_cost=Decimal('500.00'),
            currency=self.usd,
            hs_code=self.hs_code
        )
        result = DutyCalculationEngine.calculate(req)
        
        # CIF = 10000 + 1000 + 500 = 11500
        self.assertEqual(result.total_customs_value, Decimal('11500.00'))
        
        # Base Duty = 40% of 11500 = 4600
        self.assertEqual(result.total_import_duty, Decimal('4600.00'))
        
        # Excise = 5% of 11500 = 575
        self.assertEqual(result.total_excise, Decimal('575.00'))
        
        # Surtax = 10% of (11500 + 4600) = 1610
        self.assertEqual(result.total_surtax, Decimal('1610.00'))
        
        # VAT = 15% of (11500 + 4600 + 575 + 1610) = 15% of 18285 = 2742.75
        self.assertEqual(result.total_vat, Decimal('2742.75'))
        
        # Grand Total = 18285 + 2742.75 = 21027.75
        self.assertEqual(result.grand_total, Decimal('21027.75'))

    def test_engine_trade_agreement(self):
        req = CalculationRequest(
            product_value=Decimal('10000.00'),
            quantity=1,
            shipping_cost=Decimal('1000.00'),
            insurance_cost=Decimal('500.00'),
            currency=self.usd,
            hs_code=self.hs_code,
            country_of_origin=self.sa,
            trade_agreement=self.sadc
        )
        result = DutyCalculationEngine.calculate(req)
        
        # SADC Duty = 10% of 11500 = 1150
        self.assertEqual(result.total_import_duty, Decimal('1150.00'))

    def test_engine_duty_exemption(self):
        req = CalculationRequest(
            product_value=Decimal('10000.00'),
            quantity=1,
            shipping_cost=Decimal('1000.00'),
            insurance_cost=Decimal('500.00'),
            currency=self.usd,
            hs_code=self.hs_code,
            duty_exemption=self.diplomat_exemption
        )
        result = DutyCalculationEngine.calculate(req)
        
        # Duty waived to 0
        self.assertEqual(result.total_import_duty, Decimal('0.00'))
        self.assertEqual(result.exemptions_applied, "Diplomatic")

    def test_api_estimate_endpoint(self):
        url = reverse('calculation-estimate')
        data = {
            "product_value": "10000.00",
            "quantity": 1,
            "shipping_cost": "1000.00",
            "insurance_cost": "500.00",
            "currency_code": "USD",
            "hs_code": "8703.23.00"
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['financials']['grand_total'], "21027.75")
        self.assertTrue(len(response.data['explanations']) > 0)

    def test_api_save_estimate_authenticated(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('calculation-save-estimate')
        data = {
            "product_value": "10000.00",
            "quantity": 1,
            "shipping_cost": "1000.00",
            "insurance_cost": "500.00",
            "currency_code": "USD",
            "hs_code": "8703.23.00",
            "notes": "Testing save endpoint"
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('saved_id', response.data)
        
        # Verify db persistence
        self.assertTrue(SavedCalculation.objects.filter(user=self.user, hs_code__code="8703.23.00").exists())
