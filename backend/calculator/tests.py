from decimal import Decimal
from django.utils import timezone
from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from tariffs.models import TariffCategory, HSCode, VATRate
from exchange.models import ExchangeRate

class CalculationEngineTests(APITestCase):
    def setUp(self):
        self.category = TariffCategory.objects.create(name='Test Category', slug='test')
        
        # VAT
        VATRate.objects.create(rate=Decimal('15.00'), effective_from='2020-01-01')
        
        # Exchange Rates
        ExchangeRate.objects.create(base_currency='USD', target_currency='ZAR', rate=Decimal('18.200000'), fetched_at=timezone.now())
        
        # 1. Standard taxable (25% duty, 15% VAT, 0 surtax/excise)
        self.hs_standard = HSCode.objects.create(
            code='0000.11.00', name='Standard', category=self.category,
            duty_rate=Decimal('25.00'), vat_applicable=True,
            surtax_rate=None, excise_rate=None, is_duty_free=False
        )
        
        # 2. Duty-free item
        self.hs_free = HSCode.objects.create(
            code='0000.22.00', name='Duty Free', category=self.category,
            duty_rate=Decimal('0.00'), vat_applicable=True,
            surtax_rate=None, excise_rate=None, is_duty_free=True
        )
        
        # 3. Surtax + Excise item
        self.hs_heavy = HSCode.objects.create(
            code='0000.33.00', name='Heavy Tax', category=self.category,
            duty_rate=Decimal('40.00'), vat_applicable=True,
            surtax_rate=Decimal('25.00'), excise_rate=Decimal('25.00'), is_duty_free=False
        )
        
        self.url = reverse('calculate-duty')

    def test_standard_taxable_item(self):
        data = {
            'hs_code': '0000.11.00',
            'product_price': '100.00',
            'shipping_cost': '10.00',
            'insurance': '5.00',
            'quantity': 1,
            'currency': 'USD'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # CIF = 115
        # Duty = 115 * 0.25 = 28.75
        # VAT = (115 + 28.75) * 0.15 = 143.75 * 0.15 = 21.56
        res = response.data
        self.assertEqual(res['cif_value'], '115.00')
        self.assertEqual(res['import_duty'], '28.75')
        self.assertEqual(res['vat'], '21.56')
        self.assertEqual(res['surtax'], '0.00')
        self.assertEqual(res['excise_duty'], '0.00')
        self.assertEqual(res['total_taxes'], '50.31')
        self.assertEqual(res['grand_total'], '165.31')

    def test_duty_free_item(self):
        data = {
            'hs_code': '0000.22.00',
            'product_price': '100.00',
            'shipping_cost': '0.00',
            'insurance': '0.00',
            'quantity': 2,
            'currency': 'USD'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        res = response.data
        # CIF = 200
        self.assertTrue(res['duty_free'])
        self.assertEqual(res['import_duty'], '0.00')
        self.assertEqual(res['surtax'], '0.00')
        self.assertEqual(res['excise_duty'], '0.00')
        self.assertEqual(res['vat'], '0.00')
        self.assertEqual(res['total_taxes'], '0.00')
        self.assertEqual(res['grand_total'], '200.00')

    def test_surtax_and_excise(self):
        data = {
            'hs_code': '0000.33.00',
            'product_price': '100.00',
            'shipping_cost': '0.00',
            'insurance': '0.00',
            'quantity': 1,
            'currency': 'USD'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        res = response.data
        # CIF = 100
        # Duty = 100 * 0.40 = 40.00
        # Surtax = 100 * 0.25 = 25.00
        # Excise = (100 + 40) * 0.25 = 35.00
        # VAT = (100 + 40 + 25 + 35) * 0.15 = 200 * 0.15 = 30.00
        self.assertEqual(res['cif_value'], '100.00')
        self.assertEqual(res['import_duty'], '40.00')
        self.assertEqual(res['surtax'], '25.00')
        self.assertEqual(res['excise_duty'], '35.00')
        self.assertEqual(res['vat'], '30.00')

    def test_currency_conversion(self):
        # 182 ZAR with 18.2 rate = 10 USD
        data = {
            'hs_code': '0000.11.00',
            'product_price': '182.00',
            'shipping_cost': '0.00',
            'insurance': '0.00',
            'quantity': 1,
            'currency': 'ZAR'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['cif_value'], '10.00')

    def test_invalid_hs_code(self):
        data = {
            'hs_code': 'INVALID.CODE',
            'product_price': '100.00',
            'shipping_cost': '10.00',
            'insurance': '5.00',
            'currency': 'USD'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("not found in the tariff database", response.data['error'])

    def test_missing_exchange_rate(self):
        data = {
            'hs_code': '0000.11.00',
            'product_price': '100.00',
            'shipping_cost': '10.00',
            'insurance': '5.00',
            'currency': 'GBP'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("No exchange rate found for currency 'GBP'", response.data['error'])
