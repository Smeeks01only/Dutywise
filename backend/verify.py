import os
import django
import json
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dutywise_backend.settings')
django.setup()

from django.core.management import call_command
from django.test import Client
from tariffs.models import TariffCategory, HSCode, VATRate
from exchange.models import ExchangeRate
from accounts.models import SavedCalculation
from calculator.services import calculate_duty

def print_step(title):
    print(f"\n{'='*50}\n{title}\n{'='*50}")

def run():
    print_step("0. Setup: Migrating and Seeding DB")
    call_command('migrate', interactive=False)
    call_command('seed_data', flush=True)

    print_step("1. Confirm seed data loaded")
    print(f"TariffCategory count: {TariffCategory.objects.count()}")
    print(f"HSCode count: {HSCode.objects.count()}")
    print(f"VATRate count: {VATRate.objects.count()}")
    print(f"ExchangeRate count: {ExchangeRate.objects.count()}")

    print_step("2. Call calculation service directly")
    print("\n--- Duty-free item (Laptops: 8471.30.00) ---")
    try:
        res1 = calculate_duty(
            hs_code='8471.30.00',
            product_price=Decimal('1000.00'),
            shipping_cost=Decimal('50.00'),
            insurance=Decimal('10.00'),
            quantity=1,
            currency='USD'
        )
        print(json.dumps(res1, indent=2))
    except Exception as e:
        print(f"Error: {e}")

    print("\n--- Taxable item with surtax+excise (Cigarettes: 2402.20.00) ---")
    try:
        res2 = calculate_duty(
            hs_code='2402.20.00',
            product_price=Decimal('100.00'),
            shipping_cost=Decimal('20.00'),
            insurance=Decimal('5.00'),
            quantity=10,
            currency='USD'
        )
        print(json.dumps(res2, indent=2))
    except Exception as e:
        print(f"Error: {e}")

    print_step("3. API Endpoints (via Test Client)")
    client = Client(SERVER_NAME='localhost')

    # GET /api/search/?q=phone
    print("\n--- GET /api/search/?q=phone ---")
    resp = client.get('/api/search/?q=phone')
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), indent=2))

    # GET /api/categories/
    print("\n--- GET /api/categories/ ---")
    resp = client.get('/api/categories/')
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json()[:1], indent=2), "... (truncated for brevity)")

    # GET /api/exchange-rates/
    print("\n--- GET /api/exchange-rates/ ---")
    resp = client.get('/api/exchange-rates/')
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), indent=2))

    # POST /api/calculate/ (valid)
    print("\n--- POST /api/calculate/ (valid) ---")
    payload = {
        'hs_code': '8517.12.00', # Smartphones
        'product_price': '500.00',
        'shipping_cost': '20.00',
        'insurance': '10.00',
        'quantity': 1,
        'currency': 'USD'
    }
    resp = client.post('/api/calculate/', data=payload, content_type='application/json')
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), indent=2))

    # POST /api/calculate/ (invalid)
    print("\n--- POST /api/calculate/ (invalid hs_code) ---")
    payload_invalid = payload.copy()
    payload_invalid['hs_code'] = 'INVALID'
    resp = client.post('/api/calculate/', data=payload_invalid, content_type='application/json')
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), indent=2))

    # Auth
    print("\n--- POST /api/auth/register/ ---")
    resp = client.post('/api/auth/register/', data={'email':'test1@test.com', 'password':'Password123!', 'password_confirm':'Password123!'}, content_type='application/json')
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), indent=2) if resp.content else "Empty response")

    client.post('/api/auth/register/', data={'email':'test2@test.com', 'password':'Password123!', 'password_confirm':'Password123!'}, content_type='application/json')

    print("\n--- POST /api/auth/login/ (User 1) ---")
    resp = client.post('/api/auth/login/', data={'username':'test1@test.com', 'password':'Password123!'}, content_type='application/json')
    print(f"Status: {resp.status_code}")
    tokens1 = resp.json()
    print("Tokens received. (Access token snippet):", tokens1.get('access', '')[:20] + "...")
    
    resp2 = client.post('/api/auth/login/', data={'username':'test2@test.com', 'password':'Password123!'}, content_type='application/json')
    tokens2 = resp2.json()

    print("\n--- POST /api/calculations/ (Save calc) ---")
    calc_payload = {
        'hs_code': HSCode.objects.first().id,
        'input_snapshot': payload,
        'result_snapshot': {'total': 100}
    }
    resp = client.post('/api/calculations/', data=calc_payload, content_type='application/json', HTTP_AUTHORIZATION=f"Bearer {tokens1['access']}")
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), indent=2))
    saved_calc_id = resp.json()['id']

    print("\n--- GET /api/calculations/ (List) ---")
    resp = client.get('/api/calculations/', HTTP_AUTHORIZATION=f"Bearer {tokens1['access']}")
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), indent=2))

    print("\n--- DELETE /api/calculations/<id>/ (Different user) ---")
    resp = client.delete(f'/api/calculations/{saved_calc_id}/', HTTP_AUTHORIZATION=f"Bearer {tokens2['access']}")
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), indent=2) if resp.content else "Empty response")

if __name__ == '__main__':
    run()
