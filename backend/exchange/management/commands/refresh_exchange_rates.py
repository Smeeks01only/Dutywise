import json
import urllib.request
import urllib.error
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from exchange.models import ExchangeRate

def fetch_rates_from_api(base_currency='USD'):
    """
    Isolated function to fetch rates from a free public API.
    Currently uses open.er-api.com (ExchangeRate-API free tier).
    No API key is required.
    """
    url = f"https://open.er-api.com/v6/latest/{base_currency}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                return data.get('rates', {})
    except urllib.error.URLError as e:
        raise Exception(f"Network error while fetching rates: {e}")
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse JSON from API: {e}")
    except Exception as e:
        raise Exception(f"Unexpected error fetching rates: {e}")
    
    return {}

class Command(BaseCommand):
    help = 'Fetches current exchange rates from a public API and saves them.'

    def handle(self, *args, **options):
        self.stdout.write("Fetching latest exchange rates for USD...")
        
        try:
            rates_data = fetch_rates_from_api(base_currency='USD')
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Failed to refresh exchange rates: {e}"))
            return

        if not rates_data:
            self.stderr.write(self.style.ERROR("API returned successfully but no rates data was found."))
            return

        supported_targets = [choice[0] for choice in ExchangeRate.TARGET_CURRENCIES]
        created_count = 0
        now = timezone.now()

        for target in supported_targets:
            if target in rates_data:
                rate_value = Decimal(str(rates_data[target]))
                ExchangeRate.objects.create(
                    base_currency='USD',
                    target_currency=target,
                    rate=rate_value,
                    fetched_at=now
                )
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Saved USD -> {target}: {rate_value}"))
            else:
                self.stdout.write(self.style.WARNING(
                    f"Warning: Currency '{target}' was not found in the API response. "
                    f"Skipping. The system will continue using its last known rate."
                ))

        self.stdout.write(self.style.SUCCESS(f"Successfully refreshed {created_count} exchange rates."))
