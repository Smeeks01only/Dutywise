from decimal import Decimal, ROUND_HALF_UP
from tariffs.models import HSCode, VATRate
from exchange.models import ExchangeRate

class CalculationError(Exception):
    """Custom exception for calculation errors that should be caught and returned as 400s."""
    pass

def calculate_duty(hs_code: str, product_price: Decimal, shipping_cost: Decimal, 
                   insurance: Decimal, quantity: int, currency: str) -> dict:
    
    # 1. Look up HS Code
    try:
        hs = HSCode.objects.get(code=hs_code)
    except HSCode.DoesNotExist:
        raise CalculationError(f"HS Code '{hs_code}' not found in the tariff database.")

    # 2. Convert values to USD if necessary
    usd_price = product_price
    usd_shipping = shipping_cost
    usd_insurance = insurance

    if currency != 'USD':
        try:
            # We want the latest exchange rate for USD to this currency
            rate_obj = ExchangeRate.objects.filter(base_currency='USD', target_currency=currency).latest('fetched_at')
        except ExchangeRate.DoesNotExist:
            raise CalculationError(f"No exchange rate found for currency '{currency}'.")
        
        # If USD -> ZAR is 18.2, then to get USD from ZAR we divide by the rate
        usd_price = product_price / rate_obj.rate
        usd_shipping = shipping_cost / rate_obj.rate
        usd_insurance = insurance / rate_obj.rate

    # 3. Compute CIF
    qty_decimal = Decimal(quantity)
    cif_value = (usd_price * qty_decimal) + usd_shipping + usd_insurance

    # 4. Compute Duty, Surtax, Excise
    duty_rate_pct = hs.duty_rate / Decimal('100.00')
    import_duty = cif_value * duty_rate_pct

    surtax_rate_pct = hs.surtax_rate / Decimal('100.00') if hs.surtax_rate else Decimal('0')
    surtax = cif_value * surtax_rate_pct

    excise_rate_pct = hs.excise_rate / Decimal('100.00') if hs.excise_rate else Decimal('0')
    excise_duty = (cif_value + import_duty) * excise_rate_pct

    # 5. Compute VAT
    vat = Decimal('0')
    if hs.vat_applicable and not hs.is_duty_free:
        try:
            active_vat = VATRate.objects.get(effective_to__isnull=True)
            vat_rate_pct = active_vat.rate / Decimal('100.00')
        except VATRate.DoesNotExist:
            # Fallback if no active VAT rate found, though this is a config error
            raise CalculationError("No active VAT rate found in the system.")
        
        vat = (cif_value + import_duty + surtax + excise_duty) * vat_rate_pct

    # 6. Apply Duty Free overrides
    if hs.is_duty_free:
        import_duty = Decimal('0')
        surtax = Decimal('0')
        excise_duty = Decimal('0')
        vat = Decimal('0')

    # 7. Totals
    total_taxes = import_duty + surtax + excise_duty + vat
    grand_total = cif_value + total_taxes

    # Helper function to round and format cleanly
    def fmt(val: Decimal) -> str:
        return str(val.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))

    # 8. Return dict
    return {
        'hs_code': hs.code,
        'product_name': hs.name,
        'duty_free': hs.is_duty_free,
        'cif_value': fmt(cif_value),
        'import_duty': fmt(import_duty),
        'surtax': fmt(surtax),
        'excise_duty': fmt(excise_duty),
        'vat': fmt(vat),
        'total_taxes': fmt(total_taxes),
        'grand_total': fmt(grand_total)
    }
