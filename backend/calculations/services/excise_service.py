from decimal import Decimal
from .schemas import CalculationRequest, CalculationResult, LineItemExplanation
from tariffs.models import TariffRate

class ExciseService:
    @staticmethod
    def calculate(request: CalculationRequest, result: CalculationResult, cif_usd: Decimal) -> Decimal:
        """
        Calculates Excise Duty.
        Excise is usually calculated on CIF or based on specific quantities.
        """
        tariff = TariffRate.objects.filter(
            hs_code=request.hs_code,
            tariff_type=TariffRate.TariffType.EXCISE,
            is_current=True,
            status='Active',
            effective_from__lte=request.import_date
        ).order_by('-effective_from').first()
        
        if not tariff:
            return Decimal('0.00')

        excise_amount = Decimal('0.00')
        explanation_base = ""
        
        if tariff.calculation_basis == TariffRate.CalculationBasis.PERCENTAGE and tariff.percentage_rate is not None:
            excise_amount = (cif_usd * tariff.percentage_rate) / Decimal('100.00')
            excise_amount = excise_amount.quantize(Decimal('0.01'))
            explanation_base = f"Calculated at {tariff.percentage_rate}% of CIF ({cif_usd})."
            
        elif tariff.calculation_basis == TariffRate.CalculationBasis.QUANTITY and tariff.fixed_amount is not None:
            excise_amount = tariff.fixed_amount * Decimal(request.quantity)
            excise_amount = excise_amount.quantize(Decimal('0.01'))
            explanation_base = f"Calculated as Fixed Amount of {tariff.fixed_amount} * {request.quantity} units."
            
        else:
            result.warnings.append(f"Unsupported calculation basis '{tariff.calculation_basis}' for Excise Duty.")
            return Decimal('0.00')

        result.total_excise = excise_amount
        result.explanations.append(LineItemExplanation(
            name="Excise Duty",
            amount=excise_amount,
            explanation=f"Based on HS Code {request.hs_code.code}. {explanation_base}"
        ))
        
        return excise_amount
