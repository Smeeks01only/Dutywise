from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from customs.models import GovernmentAgency, TradeAgreement
from products.models import HSCode
from tariffs.models import TariffRate
from core.models import Country

class CustomsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.country = Country.objects.create(name="Zimbabwe", iso_code="ZW", currency_code="USD")
        self.agency = GovernmentAgency.objects.create(name="ZIMRA")
        self.hscode = HSCode.objects.create(code="8703.23.00", description="Vehicles")
        self.tariff = TariffRate.objects.create(
            hs_code=self.hscode, 
            country=self.country, 
            percentage_rate=15.00, 
            effective_from="2026-01-01",
            tariff_type='IMPORT_DUTY'
        )

    def test_get_hs_codes(self):
        url = reverse('hscode-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['code'], "8703.23.00")

    def test_search_hs_codes(self):
        url = reverse('hscode-list') + "?search=Vehicles"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_filter_tariffs(self):
        url = reverse('tariffrate-list') + "?tariff_type=IMPORT_DUTY"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(float(response.data['results'][0]['percentage_rate']), 15.00)

    def test_read_only_protection(self):
        url = reverse('hscode-list')
        response = self.client.post(url, {"code": "1234.56.78", "description": "New"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
