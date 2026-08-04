from decimal import Decimal
from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from .models import TariffCategory, HSCode

class SearchAndCategoryTests(APITestCase):
    def setUp(self):
        # Category
        self.electronics = TariffCategory.objects.create(name='Electronics', slug='electronics')
        self.food = TariffCategory.objects.create(name='Agriculture & Food', slug='food')
        
        # Items
        self.phone = HSCode.objects.create(
            code='8517.12.00', name='Smartphones', category=self.electronics,
            duty_rate=Decimal('25.00'), vat_applicable=True,
            surtax_rate=None, excise_rate=None, is_duty_free=False,
            search_aliases='iPhone, cellphone, mobile'
        )
        self.laptop = HSCode.objects.create(
            code='8471.30.00', name='Laptops', category=self.electronics,
            duty_rate=Decimal('0.00'), vat_applicable=True,
            surtax_rate=None, excise_rate=None, is_duty_free=True,
            search_aliases='macbook, pc'
        )
        
        self.search_url = reverse('search')
        self.categories_url = reverse('categories')

    def test_search_returns_expected_item(self):
        # 1. Exact match on name
        res = self.client.get(f"{self.search_url}?q=Smartphones")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['name'], 'Smartphones')

        # 2. Match on alias
        res = self.client.get(f"{self.search_url}?q=iphone")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['name'], 'Smartphones')

        # 3. Match on code
        res = self.client.get(f"{self.search_url}?q=8471")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['name'], 'Laptops')

        # 4. Match on category name
        res = self.client.get(f"{self.search_url}?q=Electronics")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)  # Should return both phone and laptop

    def test_search_empty_query_handling(self):
        # Empty query parameter
        res = self.client.get(f"{self.search_url}?q=")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 0)
        
        # Missing query parameter entirely
        res = self.client.get(self.search_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 0)

    def test_search_no_matches(self):
        res = self.client.get(f"{self.search_url}?q=nonexistentitem")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 0)

    def test_category_endpoint(self):
        res = self.client.get(self.categories_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)
        
        # Check order and counts
        # Agriculture & Food (0 items)
        self.assertEqual(res.data[0]['name'], 'Agriculture & Food')
        self.assertEqual(res.data[0]['hs_code_count'], 0)
        
        # Electronics (2 items)
        self.assertEqual(res.data[1]['name'], 'Electronics')
        self.assertEqual(res.data[1]['hs_code_count'], 2)
