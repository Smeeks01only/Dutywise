import random
from datetime import datetime, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model

from core.models import Country, Currency
from products.models import Category, HSCode, Product
from tariffs.models import TariffRate, ImportRestriction
from exchange_rates.models import ExchangeRate

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with realistic development data for DutyWise Zimbabwe'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding database...")

        # 1. Clear existing data
        self.stdout.write("Clearing existing data...")
        ExchangeRate.objects.all().delete()
        ImportRestriction.objects.all().delete()
        TariffRate.objects.all().delete()
        Product.objects.all().delete()
        HSCode.objects.all().delete()
        Category.objects.all().delete()
        Country.objects.all().delete()
        Currency.objects.all().delete()

        # 2. Currencies (15)
        self.stdout.write("Creating currencies...")
        currency_data = [
            ("USD", "US Dollar", "$", 2),
            ("ZWG", "Zimbabwe Gold", "ZWG", 2),
            ("ZAR", "South African Rand", "R", 2),
            ("GBP", "British Pound", "£", 2),
            ("EUR", "Euro", "€", 2),
            ("BWP", "Botswana Pula", "P", 2),
            ("JPY", "Japanese Yen", "¥", 0),
            ("CNY", "Chinese Yuan", "¥", 2),
            ("AUD", "Australian Dollar", "A$", 2),
            ("CAD", "Canadian Dollar", "C$", 2),
            ("CHF", "Swiss Franc", "CHF", 2),
            ("INR", "Indian Rupee", "₹", 2),
            ("KES", "Kenyan Shilling", "KSh", 2),
            ("ZMW", "Zambian Kwacha", "ZK", 2),
            ("AED", "UAE Dirham", "AED", 2),
        ]
        currencies = []
        for code, name, symbol, decimals in currency_data:
            currencies.append(Currency(code=code, name=name, symbol=symbol, decimal_places=decimals))
        Currency.objects.bulk_create(currencies)
        usd = Currency.objects.get(code="USD")

        # 3. Countries (20)
        self.stdout.write("Creating countries...")
        country_data = [
            ("Zimbabwe", "ZW", "ZWG"),
            ("South Africa", "ZA", "ZAR"),
            ("United States", "US", "USD"),
            ("United Kingdom", "GB", "GBP"),
            ("China", "CN", "CNY"),
            ("Japan", "JP", "JPY"),
            ("Germany", "DE", "EUR"),
            ("France", "FR", "EUR"),
            ("India", "IN", "INR"),
            ("Botswana", "BW", "BWP"),
            ("Zambia", "ZM", "ZMW"),
            ("United Arab Emirates", "AE", "AED"),
            ("Australia", "AU", "AUD"),
            ("Canada", "CA", "CAD"),
            ("Singapore", "SG", "SGD"),
            ("South Korea", "KR", "KRW"),
            ("Kenya", "KE", "KES"),
            ("Brazil", "BR", "BRL"),
            ("Italy", "IT", "EUR"),
            ("Spain", "ES", "EUR"),
        ]
        countries = []
        for name, iso, cur in country_data:
            countries.append(Country(name=name, iso_code=iso, currency_code=cur))
        Country.objects.bulk_create(countries)

        # 4. Categories (30)
        self.stdout.write("Creating categories...")
        base_categories = ["Electronics", "Vehicles", "Clothing", "Machinery", "Food & Beverages", "Furniture"]
        cats = []
        for name in base_categories:
            cat = Category.objects.create(name=name, slug=name.lower().replace(" ", "-"), description=f"All {name}")
            cats.append(cat)
            
            # Create subcategories
            for i in range(4):
                Category.objects.create(
                    name=f"{name} Subcategory {i+1}", 
                    slug=f"{name.lower().replace(' ', '-')}-sub-{i+1}",
                    parent_category=cat
                )

        all_cats = list(Category.objects.all())

        # 5. HS Codes (100)
        self.stdout.write("Creating HS Codes...")
        hs_codes = []
        for i in range(100):
            ch = str(random.randint(1, 99)).zfill(2)
            hd = ch + str(random.randint(1, 99)).zfill(2)
            sub = hd + "." + str(random.randint(1, 99)).zfill(2)
            hs = HSCode(
                code=sub,
                description=f"HS Code Description for {sub}",
                chapter=ch,
                heading=hd,
                subheading=sub
            )
            hs_codes.append(hs)
        HSCode.objects.bulk_create(hs_codes)
        all_hs = list(HSCode.objects.all())

        # 6. Products (100)
        self.stdout.write("Creating products...")
        all_countries = list(Country.objects.all())
        products = []
        for i in range(100):
            p = Product(
                name=f"Demo Product {i+1}",
                description=f"Detailed description for demo product {i+1}",
                category=random.choice(all_cats),
                hs_code=random.choice(all_hs),
                default_country=random.choice(all_countries)
            )
            products.append(p)
        Product.objects.bulk_create(products)

        # 7. Tariff Rates (100)
        self.stdout.write("Creating tariff rates...")
        tariffs = []
        for hs in all_hs:
            t = TariffRate(
                hs_code=hs,
                country=random.choice(all_countries),
                import_duty_rate=Decimal(random.randint(0, 40)),
                vat_rate=Decimal('15.00'),
                surtax_rate=Decimal(random.choice([0, 0, 10, 20])),
                effective_from=timezone.now().date() - timedelta(days=365)
            )
            tariffs.append(t)
        TariffRate.objects.bulk_create(tariffs)

        # 8. Import Restrictions (30)
        self.stdout.write("Creating import restrictions...")
        restrictions = []
        restricted_hs = random.sample(all_hs, 30)
        agencies = [c[0] for c in ImportRestriction.GovernmentAgency.choices]
        
        for hs in restricted_hs:
            r = ImportRestriction(
                hs_code=hs,
                title=f"Restriction on {hs.code}",
                description="Must adhere to local regulations.",
                license_required=random.choice([True, False]),
                permit_required=random.choice([True, False]),
                restricted=random.choice([True, False]),
                prohibited=random.choice([True, False]),
                government_agency=random.choice(agencies)
            )
            restrictions.append(r)
        ImportRestriction.objects.bulk_create(restrictions)

        # 9. Exchange Rates (20)
        self.stdout.write("Creating exchange rates...")
        rates = []
        base = usd
        all_currencies = list(Currency.objects.exclude(code="USD"))
        for i in range(20):
            target = random.choice(all_currencies)
            r = ExchangeRate(
                base_currency=base,
                target_currency=target,
                exchange_rate=Decimal(random.uniform(0.5, 20.0)),
                source="RBZ",
                date=timezone.now().date() - timedelta(days=random.randint(0, 30))
            )
            rates.append(r)
        ExchangeRate.objects.bulk_create(rates)

        self.stdout.write(self.style.SUCCESS("Successfully seeded development data!"))
