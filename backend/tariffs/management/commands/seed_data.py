from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
from tariffs.models import TariffCategory, HSCode, VATRate
from exchange.models import ExchangeRate

class Command(BaseCommand):
    help = 'Seeds the database with realistic placeholder data for DutyWise Zimbabwe.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--flush',
            action='store_true',
            help='Clear all existing categories, HS codes, VAT rates, and exchange rates before seeding.',
        )

    def handle(self, *args, **options):
        if options['flush']:
            self.stdout.write(self.style.WARNING('Flushing existing seed data...'))
            HSCode.objects.all().delete()
            TariffCategory.objects.all().delete()
            VATRate.objects.all().delete()
            ExchangeRate.objects.all().delete()

        self.stdout.write('Seeding Tariff Categories...')
        categories_data = [
            {'name': 'Electronics', 'slug': 'electronics'},
            {'name': 'Clothing & Footwear', 'slug': 'clothing-footwear'},
            {'name': 'Vehicles & Parts', 'slug': 'vehicles-parts'},
            {'name': 'Agriculture & Food', 'slug': 'agriculture-food'},
            {'name': 'Medical & Pharmaceuticals', 'slug': 'medical-pharmaceuticals'},
            {'name': 'Cosmetics & Personal Care', 'slug': 'cosmetics-personal-care'},
            {'name': 'Alcohol & Tobacco', 'slug': 'alcohol-tobacco'},
            {'name': 'Building & Solar', 'slug': 'building-solar'},
        ]
        
        category_objects = {}
        for cat_data in categories_data:
            cat, created = TariffCategory.objects.get_or_create(
                slug=cat_data['slug'], 
                defaults={'name': cat_data['name'], 'description': f"Items related to {cat_data['name']}"}
            )
            category_objects[cat_data['name']] = cat

        self.stdout.write('Seeding HS Codes...')
        hs_codes_data = [
            # Electronics
            {'code': '8517.12.00', 'name': 'Smartphones', 'cat': 'Electronics', 'duty': '25.00', 'vat': True, 'surtax': None, 'excise': None, 'free': False, 'aliases': 'iPhone, phone, cellphone, mobile, android, samsung'},
            {'code': '8471.30.00', 'name': 'Laptops', 'cat': 'Electronics', 'duty': '0.00', 'vat': True, 'surtax': None, 'excise': None, 'free': True, 'aliases': 'notebook, macbook, pc, computer'},
            {'code': '8528.72.00', 'name': 'Televisions', 'cat': 'Electronics', 'duty': '40.00', 'vat': True, 'surtax': None, 'excise': None, 'free': False, 'aliases': 'TV, smart tv, flat screen'},
            {'code': '8518.30.00', 'name': 'Headphones/Earbuds', 'cat': 'Electronics', 'duty': '40.00', 'vat': True, 'surtax': None, 'excise': None, 'free': False, 'aliases': 'earphones, airpods, headsets'},
            {'code': '9504.50.00', 'name': 'Gaming Consoles', 'cat': 'Electronics', 'duty': '40.00', 'vat': True, 'surtax': None, 'excise': None, 'free': False, 'aliases': 'playstation, ps5, xbox, nintendo switch'},
            
            # Clothing
            {'code': '6203.42.00', 'name': 'General Clothing (Trousers)', 'cat': 'Clothing & Footwear', 'duty': '40.00', 'vat': True, 'surtax': None, 'excise': None, 'free': False, 'aliases': 'pants, jeans, shorts, clothes'},
            {'code': '6403.99.00', 'name': 'Sneakers/Shoes', 'cat': 'Clothing & Footwear', 'duty': '40.00', 'vat': True, 'surtax': None, 'excise': None, 'free': False, 'aliases': 'footwear, boots, kicks, trainers'},
            
            # Vehicles
            {'code': '8703.23.00', 'name': 'Used Vehicles (1500cc-3000cc)', 'cat': 'Vehicles & Parts', 'duty': '40.00', 'vat': True, 'surtax': '5.00', 'excise': None, 'free': False, 'aliases': 'car, auto, motor vehicle, toyota, honda'},
            {'code': '8708.99.00', 'name': 'Vehicle Spare Parts (General)', 'cat': 'Vehicles & Parts', 'duty': '15.00', 'vat': True, 'surtax': None, 'excise': None, 'free': False, 'aliases': 'auto parts, spares, brakes, filters'},
            {'code': '4011.10.00', 'name': 'Tyres (New, Motor Car)', 'cat': 'Vehicles & Parts', 'duty': '15.00', 'vat': True, 'surtax': None, 'excise': None, 'free': False, 'aliases': 'tires, wheels'},
            
            # Agriculture
            {'code': '1905.90.00', 'name': 'Packaged Food (Biscuits/Bread)', 'cat': 'Agriculture & Food', 'duty': '40.00', 'vat': True, 'surtax': '25.00', 'excise': None, 'free': False, 'aliases': 'snacks, cookies, groceries'},
            {'code': '1005.10.00', 'name': 'Maize Seed', 'cat': 'Agriculture & Food', 'duty': '0.00', 'vat': False, 'surtax': None, 'excise': None, 'free': True, 'aliases': 'corn seed, agricultural seed'},
            
            # Medical
            {'code': '3004.90.00', 'name': 'Medicines (General)', 'cat': 'Medical & Pharmaceuticals', 'duty': '0.00', 'vat': False, 'surtax': None, 'excise': None, 'free': True, 'aliases': 'drugs, pills, medication, paracetamol, antibiotics'},
            {'code': '9018.90.00', 'name': 'Medical Equipment', 'cat': 'Medical & Pharmaceuticals', 'duty': '0.00', 'vat': False, 'surtax': None, 'excise': None, 'free': True, 'aliases': 'surgical instruments, hospital gear'},
            
            # Cosmetics
            {'code': '3304.99.00', 'name': 'Cosmetics/Skincare', 'cat': 'Cosmetics & Personal Care', 'duty': '40.00', 'vat': True, 'surtax': None, 'excise': None, 'free': False, 'aliases': 'makeup, lotion, cream, beauty products'},
            {'code': '3303.00.00', 'name': 'Perfumes', 'cat': 'Cosmetics & Personal Care', 'duty': '40.00', 'vat': True, 'surtax': None, 'excise': '15.00', 'free': False, 'aliases': 'cologne, fragrance'},
            
            # Alcohol & Tobacco
            {'code': '2208.30.00', 'name': 'Whiskies (Alcohol)', 'cat': 'Alcohol & Tobacco', 'duty': '40.00', 'vat': True, 'surtax': '25.00', 'excise': '25.00', 'free': False, 'aliases': 'whiskey, liquor, spirits, scotch'},
            {'code': '2402.20.00', 'name': 'Cigarettes', 'cat': 'Alcohol & Tobacco', 'duty': '40.00', 'vat': True, 'surtax': '25.00', 'excise': '50.00', 'free': False, 'aliases': 'tobacco, smokes'},
            
            # Building & Solar
            {'code': '8541.40.00', 'name': 'Solar Panels', 'cat': 'Building & Solar', 'duty': '0.00', 'vat': True, 'surtax': None, 'excise': None, 'free': True, 'aliases': 'pv panels, solar power'},
            {'code': '8507.20.00', 'name': 'Solar Batteries (Lead Acid)', 'cat': 'Building & Solar', 'duty': '0.00', 'vat': True, 'surtax': None, 'excise': None, 'free': True, 'aliases': 'inverter battery, power storage'},
            {'code': '6907.21.00', 'name': 'Ceramic Tiles', 'cat': 'Building & Solar', 'duty': '25.00', 'vat': True, 'surtax': '25.00', 'excise': None, 'free': False, 'aliases': 'floor tiles, wall tiles, building tiles'},
            {'code': '2523.29.00', 'name': 'Portland Cement', 'cat': 'Building & Solar', 'duty': '15.00', 'vat': True, 'surtax': '25.00', 'excise': None, 'free': False, 'aliases': 'cement, mortar'},
        ]

        created_hs_codes = 0
        for hs in hs_codes_data:
            obj, created = HSCode.objects.get_or_create(
                code=hs['code'],
                defaults={
                    'name': hs['name'],
                    'category': category_objects[hs['cat']],
                    'duty_rate': Decimal(hs['duty']),
                    'vat_applicable': hs['vat'],
                    'surtax_rate': Decimal(hs['surtax']) if hs['surtax'] else None,
                    'excise_rate': Decimal(hs['excise']) if hs['excise'] else None,
                    'is_duty_free': hs['free'],
                    'search_aliases': hs['aliases']
                }
            )
            if created:
                created_hs_codes += 1

        self.stdout.write('Seeding VAT Rate...')
        vat, vat_created = VATRate.objects.get_or_create(
            rate=Decimal('15.00'),
            effective_to__isnull=True,
            defaults={'effective_from': '2024-01-01'}
        )

        self.stdout.write('Seeding Exchange Rates (Placeholders)...')
        # WARNING: Placeholder values. Must be replaced by real fetching logic later.
        rates_data = [
            {'target': 'ZWG', 'rate': '13.800000'},
            {'target': 'ZAR', 'rate': '18.200000'},
            {'target': 'GBP', 'rate': '0.790000'},
        ]
        created_ex = 0
        for r in rates_data:
            obj, created = ExchangeRate.objects.get_or_create(
                base_currency='USD',
                target_currency=r['target'],
                defaults={'rate': Decimal(r['rate']), 'fetched_at': timezone.now()}
            )
            if created:
                created_ex += 1

        self.stdout.write(self.style.SUCCESS(
            f'\nSeeding complete!\n'
            f'- {len(categories_data)} Categories processed.\n'
            f'- {created_hs_codes} HS Codes created.\n'
            f'- {"1" if vat_created else "0"} active VAT Rate created.\n'
            f'- {created_ex} Exchange Rates created.\n'
            f'\nIMPORTANT: The generated rates are best-effort placeholders and must be verified against the official ZIMRA tariff schedule.'
        ))
