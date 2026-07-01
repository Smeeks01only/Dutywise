from decimal import Decimal
from .schemas import CalculationRequest, CalculationResult, LineItemExplanation
from tariffs.models import TariffRate

class CarbonTaxService:
    @staticmethod
    def calculate(request: CalculationRequest, result: CalculationResult) -> Decimal:
        """
        Calculates Carbon Tax.
        Usually based on Engine Capacity, Age, or specific quantities.
        We will support Fixed Amount or Percentage on CIF.
        """
        tariff = TariffRate.objects.filter(
            hs_code=request.hs_code,
            tariff_type=TariffRate.TariffType.CARBON_TAX,
            is_current=True,
            status='Active',
            effective_from__lte=request.import_date
        ).order_by('-effective_from').first()
        
        if not tariff:
            return Decimal('0.00')

        tax_amount = Decimal('0.00')
        explanation_base = ""
        
        if tariff.calculation_basis == TariffRate.CalculationBasis.QUANTITY and tariff.fixed_amount is not None:
            tax_amount = tariff.fixed_amount * Decimal(request.quantity)
            tax_amount = tax_amount.quantize(Decimal('0.01'))
            explanation_base = f"Calculated as Fixed Amount of {tariff.fixed_amount} * {request.quantity} units."
            
        else:
            result.warnings.append(f"Carbon tax calculation currently only supports Fixed Amount (QUANTITY). Found: '{tariff.calculation_basis}'.")
            return Decimal('0.00')

        result.total_carbon_tax = tax_amount
        result.explanations.append(LineItemExplanation(
            name="Carbon Tax",
            amount=tax_amount,
            explanation=f"Based on HS Code {request.hs_code.code}. {explanation_base}"
        ))
        
        return tax_amount
