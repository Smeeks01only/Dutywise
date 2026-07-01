import random
import uuid
from datetime import timedelta
from django.utils import timezone
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from faker import Faker

from core.models import Country, Currency
from products.models import Category, HSCode, Product
from tariffs.models import TariffRate, ImportRestriction
from customs.models import GovernmentAgency, TradeAgreement, DutyExemption
from accounts.models import User

fake = Faker()

class Command(BaseCommand):
    help = 'Seeds the database with robust customs reference data for DutyWise Zimbabwe.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Starting seed process... this might take a minute!"))
        
        with transaction.atomic():
            self._create_permissions_and_roles()
            self._create_currencies_and_countries()
            self._create_agencies_and_exemptions()
            self._create_trade_agreements()
            self._create_categories()
            self._create_hs_codes()
            self._create_products()
            self._create_tariffs()
            self._create_restrictions()

        self.stdout.write(self.style.SUCCESS("Successfully seeded the database!"))

    def _create_permissions_and_roles(self):
        admin_group, _ = Group.objects.get_or_create(name='Administrator')
        manager_group, _ = Group.objects.get_or_create(name='Data Manager')
        viewer_group, _ = Group.objects.get_or_create(name='Viewer')
        self.stdout.write("Created Groups.")

    def _create_currencies_and_countries(self):
        if Country.objects.count() >= 50:
            return
            
        usd, _ = Currency.objects.get_or_create(code='USD', defaults={'name': 'US Dollar', 'symbol': '$'})
        countries = []
        for _ in range(50):
            country_name = fake.unique.country()
            iso = fake.unique.country_code()
            countries.append(Country(name=country_name, iso_code=iso, currency_code='USD'))
        
        Country.objects.bulk_create(countries, ignore_conflicts=True)
        self.stdout.write("Created 50 Countries.")

    def _create_agencies_and_exemptions(self):
        agencies = [
            "Zimbabwe Revenue Authority (ZIMRA)",
            "Ministry of Health",
            "Plant Quarantine Services",
            "Standards Association of Zimbabwe",
            "Veterinary Services",
            "Environmental Management Agency",
            "Medicines Control Authority of Zimbabwe"
        ]
        db_agencies = []
        for name in agencies:
            ag, _ = GovernmentAgency.objects.get_or_create(
                name=name,
                defaults={'website': fake.url(), 'email': fake.email(), 'phone': fake.phone_number()}
            )
            db_agencies.append(ag)
        
        exemptions = [
            "Diplomatic Imports", "Government Imports", "NGOs", 
            "Humanitarian Aid", "Educational Equipment", "Medical Equipment", "Solar Equipment"
        ]
        for name in exemptions:
            DutyExemption.objects.get_or_create(
                name=name,
                defaults={
                    'eligibility': fake.paragraph(),
                    'approval_authority': random.choice(db_agencies)
                }
            )
        self.stdout.write("Created Agencies & Exemptions.")

    def _create_trade_agreements(self):
        if TradeAgreement.objects.count() >= 10:
            return
            
        agreements = ["SADC", "COMESA", "AfCFTA", "Bilateral - South Africa", "Bilateral - Botswana", "Bilateral - Mozambique"]
        for name in agreements:
            ta, _ = TradeAgreement.objects.get_or_create(
                name=name,
                defaults={'effective_from': timezone.now().date()}
            )
            ta.countries_covered.set(list(Country.objects.all()[:5]))
            
        for _ in range(4):
            ta = TradeAgreement.objects.create(
                name=f"Trade Agreement {fake.unique.company()}",
                effective_from=timezone.now().date()
            )
            ta.countries_covered.set(list(Country.objects.order_by('?')[:3]))
            
        self.stdout.write("Created 10 Trade Agreements.")

    def _create_categories(self):
        if Category.objects.count() >= 300:
            return
            
        categories = []
        # Create root categories
        roots = []
        for _ in range(30):
            cat = Category.objects.create(name=fake.unique.word().capitalize() + " Goods", slug=fake.unique.slug())
            roots.append(cat)
            
        # Create children
        for _ in range(270):
            parent = random.choice(roots)
            categories.append(Category(
                name=fake.unique.word().capitalize() + " " + fake.word().capitalize(),
                slug=fake.unique.slug(),
                parent_category=parent
            ))
            
        Category.objects.bulk_create(categories, batch_size=100)
        self.stdout.write("Created 300 Categories.")

    def _create_hs_codes(self):
        if HSCode.objects.count() >= 5000:
            return
            
        codes = []
        for _ in range(5000):
            c = f"{random.randint(10, 99)}{random.randint(10, 99)}.{random.randint(10, 99)}"
            codes.append(HSCode(
                code=c,
                description=fake.sentence(),
                chapter=c[:2],
                heading=c[:4],
                subheading=c[:6],
                effective_from=timezone.now().date()
            ))
            
        HSCode.objects.bulk_create(codes, batch_size=500, ignore_conflicts=True)
        self.stdout.write("Created 5000 HS Codes.")

    def _create_products(self):
        if Product.objects.count() >= 2000:
            return
            
        hs_codes = list(HSCode.objects.all()[:2000])
        categories = list(Category.objects.all())
        countries = list(Country.objects.all())
        
        products = []
        for i in range(2000):
            products.append(Product(
                name=fake.unique.catch_phrase(),
                description=fake.paragraph(),
                hs_code=hs_codes[i] if i < len(hs_codes) else random.choice(hs_codes),
                category=random.choice(categories),
                default_country=random.choice(countries)
            ))
            
        Product.objects.bulk_create(products, batch_size=500)
        self.stdout.write("Created 2000 Products.")

    def _create_tariffs(self):
        if TariffRate.objects.count() >= 5000:
            return
            
        hs_codes = list(HSCode.objects.all())
        countries = list(Country.objects.all())
        agreements = list(TradeAgreement.objects.all())
        
        tariffs = []
        for i in range(5000):
            hs = random.choice(hs_codes)
            tariffs.append(TariffRate(
                hs_code=hs,
                country=random.choice([None, None, random.choice(countries)]),
                trade_agreement=random.choice([None, None, random.choice(agreements)]),
                tariff_type=random.choice(['IMPORT_DUTY', 'VAT', 'SURTAX']),
                percentage_rate=round(random.uniform(5.0, 40.0), 2),
                effective_from=timezone.now().date() - timedelta(days=random.randint(10, 100))
            ))
            
        TariffRate.objects.bulk_create(tariffs, batch_size=500)
        self.stdout.write("Created 5000 Tariff Records.")

    def _create_restrictions(self):
        if ImportRestriction.objects.count() >= 500:
            return
            
        hs_codes = list(HSCode.objects.all())
        agencies = list(GovernmentAgency.objects.all())
        
        restrictions = []
        for _ in range(500):
            restrictions.append(ImportRestriction(
                hs_code=random.choice(hs_codes),
                restriction_type=random.choice(['RESTRICTED', 'PROHIBITED']),
                description=fake.sentence(),
                government_agency=random.choice(agencies),
                license_required=random.choice([True, False]),
                permit_required=random.choice([True, False])
            ))
            
        ImportRestriction.objects.bulk_create(restrictions, batch_size=100)
        self.stdout.write("Created 500 Import Restrictions.")
