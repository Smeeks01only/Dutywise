import csv
import os
from decimal import Decimal
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from core.models import Country, Currency
from exchange_rates.models import ExchangeRate
from customs.models import GovernmentAgency, TradeAgreement, DutyExemption
from products.models import Category, HSCode, Product
from tariffs.models import (
    TariffRate, ImportRestriction, VATRule, ExciseRule, 
    SurtaxRule, CarbonTaxRule, GovernmentFee
)

class Command(BaseCommand):
    help = 'Loads official Zimbabwe customs datasets from CSV files into the database'

    def handle(self, *args, **kwargs):
        datasets_dir = os.path.join(settings.BASE_DIR, 'datasets')
        
        self.stdout.write("Wiping existing customs reference data...")
        self.wipe_existing_data()

        self.stdout.write("Starting dataset import...")
        
        with transaction.atomic():
            # 1. Currencies & Countries
            self.load_currencies(os.path.join(datasets_dir, 'currencies.csv'))
            country_map = self.load_countries(os.path.join(datasets_dir, 'countries.csv'))
            
            # 2. Exchange Rates
            self.load_exchange_rates(os.path.join(datasets_dir, 'exchange_rates.csv'))
            
            # 3. Agencies & Agreements
            agency_map = self.load_agencies(os.path.join(datasets_dir, 'government_agencies.csv'))
            self.load_trade_agreements(os.path.join(datasets_dir, 'trade_agreements.csv'))
            
            # 4. Taxonomy
            category_map = self.load_categories(os.path.join(datasets_dir, 'product_categories.csv'))
            hscode_map = self.load_hs_codes(os.path.join(datasets_dir, 'hs_codes.csv'), category_map)
            self.load_products(os.path.join(datasets_dir, 'products.csv'), category_map, hscode_map)
            self.load_product_keywords(os.path.join(datasets_dir, 'product_keywords.csv'), hscode_map)
            
            # 5. Rules & Tariffs
            self.load_tariff_rates(os.path.join(datasets_dir, 'tariff_rates.csv'), hscode_map)
            self.load_vat_rules(os.path.join(datasets_dir, 'vat_rules.csv'), hscode_map)
            self.load_excise_rules(os.path.join(datasets_dir, 'excise_rules.csv'), hscode_map)
            self.load_surtax_rules(os.path.join(datasets_dir, 'surtax_rules.csv'), category_map)
            self.load_carbon_tax_rules(os.path.join(datasets_dir, 'carbon_tax_rules.csv'), category_map)
            
            # 6. Restrictions & Fees
            self.load_government_fees(os.path.join(datasets_dir, 'government_fees.csv'), agency_map)
            self.load_import_restrictions(os.path.join(datasets_dir, 'import_restrictions.csv'), hscode_map, agency_map, category_map)
            self.load_duty_exemptions(os.path.join(datasets_dir, 'duty_exemptions.csv'), category_map, agency_map)

        self.stdout.write(self.style.SUCCESS("Successfully imported all datasets!"))

    def wipe_existing_data(self):
        # Order matters due to foreign keys
        DutyExemption.objects.all().delete()
        ImportRestriction.objects.all().delete()
        GovernmentFee.objects.all().delete()
        CarbonTaxRule.objects.all().delete()
        SurtaxRule.objects.all().delete()
        ExciseRule.objects.all().delete()
        VATRule.objects.all().delete()
        TariffRate.objects.all().delete()
        Product.objects.all().delete()
        HSCode.objects.all().delete()
        Category.objects.all().delete()
        TradeAgreement.objects.all().delete()
        GovernmentAgency.objects.all().delete()
        ExchangeRate.objects.all().delete()
        Country.objects.all().delete()
        Currency.objects.all().delete()

    def parse_decimal(self, val):
        if not val or val.strip() == '':
            return None
        return Decimal(val.strip())

    def parse_int(self, val):
        if not val or val.strip() == '':
            return None
        return int(val.strip())

    def load_currencies(self, file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                Currency.objects.create(
                    code=row['currency_code'],
                    name=row['currency_name'],
                    symbol=row['symbol']
                )
        self.stdout.write("Loaded currencies")

    def load_countries(self, file_path):
        country_map = {}
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                c = Country.objects.create(
                    iso_code=row['iso2'],
                    name=row['country_name'],
                    currency_code=row['currency_code']
                )
                country_map[row['country_id']] = c
        self.stdout.write("Loaded countries")
        return country_map

    def load_exchange_rates(self, file_path):
        usd_currency = Currency.objects.filter(code='USD').first()
        if not usd_currency:
            self.stdout.write("Warning: USD currency not found, skipping exchange rates.")
            return

        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                currency = Currency.objects.filter(code=row['currency_code']).first()
                if currency:
                    ExchangeRate.objects.create(
                        base_currency=usd_currency,
                        target_currency=currency,
                        exchange_rate=self.parse_decimal(row['rate_to_usd']),
                        date=datetime.strptime(row['rate_date'], '%Y-%m-%d').date() if row['rate_date'] else timezone.now().date(),
                        source=row['source'],
                        is_active=True
                    )
        self.stdout.write("Loaded exchange rates")

    def load_agencies(self, file_path):
        agency_map = {}
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                a = GovernmentAgency.objects.create(
                    name=row['agency_name'],
                    description=row['role_description'],
                    website=row['website'],
                    address=row.get('contact_note', '')
                )
                agency_map[row['agency_id']] = a
        self.stdout.write("Loaded agencies")
        return agency_map

    def load_trade_agreements(self, file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                TradeAgreement.objects.create(
                    name=row['agreement_name'],
                    eligibility_rules=row['preferential_treatment'],
                    effective_from=datetime.strptime(row['effective_date'], '%Y-%m-%d').date() if row.get('effective_date') else timezone.now().date()
                )
        self.stdout.write("Loaded trade agreements")

    def load_categories(self, file_path):
        category_map = {}
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = list(csv.DictReader(f))
            
            # First pass: Create all without parents
            for row in reader:
                # slug must be unique and valid
                import re
                base_slug = re.sub(r'[^a-z0-9-]', '-', row['category_name'].lower()).strip('-')
                slug = base_slug
                counter = 1
                while Category.objects.filter(slug=slug).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                
                c = Category.objects.create(
                    name=row['category_name'],
                    slug=slug,
                    description=row['description']
                )
                category_map[row['category_id']] = c
                
            # Second pass: Assign parents
            for row in reader:
                if row['parent_category_id']:
                    parent = category_map.get(row['parent_category_id'])
                    child = category_map.get(row['category_id'])
                    if parent and child:
                        child.parent_category = parent
                        child.save()
        self.stdout.write("Loaded categories")
        return category_map

    def load_hs_codes(self, file_path, category_map):
        hscode_map = {}
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                h = HSCode.objects.create(
                    code=row['hs_code'],
                    description=row['description'],
                    effective_from=timezone.now().date()
                )
                hscode_map[row['hs_code']] = h
        self.stdout.write("Loaded HS codes")
        return hscode_map

    def load_products(self, file_path, category_map, hscode_map):
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                hscode = hscode_map.get(row['hs_code'])
                category = category_map.get(row['category_id'])
                if hscode:
                    Product.objects.create(
                        name=row['product_name'],
                        hs_code=hscode,
                        category=category,
                        brand_names=row['brand'],
                        typical_unit_value_usd=self.parse_decimal(row['typical_unit_value_usd']),
                        condition=row['condition'],
                        description=row['notes']
                    )
        self.stdout.write("Loaded products")

    def load_product_keywords(self, file_path, hscode_map):
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                hscode = hscode_map.get(row['hs_code'])
                if hscode:
                    # We will append the keyword to all products with this HS code
                    products = Product.objects.filter(hs_code=hscode)
                    for p in products:
                        existing = p.keywords if p.keywords else ""
                        p.keywords = f"{existing}, {row['keyword']}".strip(', ')
                        p.save()
        self.stdout.write("Loaded keywords")

    def load_tariff_rates(self, file_path, hscode_map):
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                hscode = hscode_map.get(row['hs_code'])
                if hscode:
                    ta = None
                    if row['rate_type'] != 'General (MFN)':
                        ta = TradeAgreement.objects.filter(name__icontains=row['rate_type'].split()[0]).first()
                        
                    TariffRate.objects.create(
                        hs_code=hscode,
                        trade_agreement=ta,
                        tariff_type=TariffRate.TariffType.IMPORT_DUTY,
                        percentage_rate=self.parse_decimal(row['duty_rate_percent']),
                        effective_from=datetime.strptime(row['effective_date'], '%Y-%m-%d').date() if row.get('effective_date') else timezone.now().date(),
                        legal_reference=row['legal_reference'],
                        notes=row['notes']
                    )
        self.stdout.write("Loaded tariff rates")

    def load_vat_rules(self, file_path, hscode_map):
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                hscode = hscode_map.get(row['hs_code'])
                if hscode:
                    VATRule.objects.create(
                        hs_code=hscode,
                        vat_rate_percent=self.parse_decimal(row['vat_rate_percent']) or Decimal('0'),
                        is_zero_rated=(row['is_zero_rated'].lower() == 'yes'),
                        is_exempt=(row['is_exempt'].lower() == 'yes'),
                        exemption_reason=row['exemption_reason'],
                        legal_reference=row['legal_reference']
                    )
        self.stdout.write("Loaded VAT rules")

    def load_excise_rules(self, file_path, hscode_map):
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                hscode = hscode_map.get(row['hs_code'])
                if hscode:
                    ExciseRule.objects.create(
                        hs_code=hscode,
                        excise_type=row['excise_type'],
                        rate_percent=self.parse_decimal(row['rate_percent']),
                        specific_amount_usd=self.parse_decimal(row['specific_amount_usd']),
                        specific_unit=row['specific_unit'],
                        legal_reference=row['legal_reference'],
                        notes=row['notes']
                    )
        self.stdout.write("Loaded Excise rules")

    def load_surtax_rules(self, file_path, category_map):
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cat = category_map.get(row['applies_to_category_id'])
                if cat:
                    SurtaxRule.objects.create(
                        applies_to_category=cat,
                        vehicle_type=row['vehicle_type'],
                        min_age_years=self.parse_int(row['min_age_years']),
                        max_age_years=self.parse_int(row['max_age_years']),
                        surtax_rate_percent=self.parse_decimal(row['surtax_rate_percent']),
                        calculated_on=row['calculated_on'],
                        legal_reference=row['legal_reference'],
                        notes=row['notes']
                    )
        self.stdout.write("Loaded Surtax rules")

    def load_carbon_tax_rules(self, file_path, category_map):
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cat = category_map.get(row['applies_to_category_id'])
                if cat:
                    CarbonTaxRule.objects.create(
                        applies_to_category=cat,
                        engine_capacity_min_cc=self.parse_int(row['engine_capacity_min_cc']),
                        engine_capacity_max_cc=self.parse_int(row['engine_capacity_max_cc']),
                        carbon_tax_amount_usd=self.parse_decimal(row['carbon_tax_amount_usd']),
                        billing_frequency=row['billing_frequency'],
                        legal_reference=row['legal_reference'],
                        notes=row['notes']
                    )
        self.stdout.write("Loaded Carbon Tax rules")

    def load_government_fees(self, file_path, agency_map):
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                agency = agency_map.get(row['agency_id'])
                GovernmentFee.objects.create(
                    fee_name=row['fee_name'],
                    applicable_to=row['applicable_to'],
                    fee_basis=row['fee_basis'],
                    amount_usd=self.parse_decimal(row['amount_usd']),
                    amount_percent=self.parse_decimal(row['amount_percent']),
                    agency=agency,
                    legal_reference=row['legal_reference'],
                    notes=row['notes']
                )
        self.stdout.write("Loaded Government Fees")

    def load_import_restrictions(self, file_path, hscode_map, agency_map, category_map):
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Can be tied to hscode or category
                hscode = hscode_map.get(row['hs_code']) if row.get('hs_code') else None
                # Restriction model doesn't currently support category linkage, we'll map if we can or just use hscode
                if hscode:
                    r_type = ImportRestriction.RestrictionType.RESTRICTED
                    if 'Banned' in row['restriction_type']:
                        r_type = ImportRestriction.RestrictionType.PROHIBITED
                        
                    ImportRestriction.objects.create(
                        hs_code=hscode,
                        restriction_type=r_type,
                        description=row['restriction_type'],
                        government_agency=agency_map.get(row['issuing_agency_id']),
                        legal_citation=row['legal_reference'],
                        required_documents=row['permit_or_licence_name']
                    )
        self.stdout.write("Loaded Import Restrictions")

    def load_duty_exemptions(self, file_path, category_map, agency_map):
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                DutyExemption.objects.create(
                    name=row['exemption_name'],
                    eligibility=row['eligible_persons'],
                    legal_basis=row['legal_reference']
                )
        self.stdout.write("Loaded Duty Exemptions")
