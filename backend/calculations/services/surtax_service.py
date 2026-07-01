from decimal import Decimal
from .schemas import CalculationRequest, CalculationResult, LineItemExplanation
from tariffs.models import TariffRate

class SurtaxService:
    @staticmethod
    def calculate(request: CalculationRequest, result: CalculationResult, cif_usd: Decimal, import_duty: Decimal) -> Decimal:
        """
        Calculates Surtax.
        Often calculated on (CIF + Import Duty) or CIF depending on the legislation.
        We will base it on CIF as a default, or Fixed Amount.
        """
        tariff = TariffRate.objects.filter(
            hs_code=request.hs_code,
            tariff_type=TariffRate.TariffType.SURTAX,
            is_current=True,
            status='Active',
            effective_from__lte=request.import_date
        ).order_by('-effective_from').first()
        
        if not tariff:
            return Decimal('0.00')

        surtax_amount = Decimal('0.00')
        explanation_base = ""
        
        if tariff.calculation_basis == TariffRate.CalculationBasis.PERCENTAGE and tariff.percentage_rate is not None:
            # Let's assume Surtax is on CIF + Duty for this implementation
            basis_value = cif_usd + import_duty
            surtax_amount = (basis_value * tariff.percentage_rate) / Decimal('100.00')
            surtax_amount = surtax_amount.quantize(Decimal('0.01'))
            explanation_base = f"Calculated at {tariff.percentage_rate}% of (CIF + Import Duty) = {basis_value}."
            
        elif tariff.calculation_basis == TariffRate.CalculationBasis.QUANTITY and tariff.fixed_amount is not None:
            surtax_amount = tariff.fixed_amount * Decimal(request.quantity)
            surtax_amount = surtax_amount.quantize(Decimal('0.01'))
            explanation_base = f"Calculated as Fixed Amount of {tariff.fixed_amount} * {request.quantity} units."
            
        else:
            result.warnings.append(f"Unsupported calculation basis '{tariff.calculation_basis}' for Surtax.")
            return Decimal('0.00')

        result.total_surtax = surtax_amount
        result.explanations.append(LineItemExplanation(
            name="Surtax",
            amount=surtax_amount,
            explanation=f"Based on HS Code {request.hs_code.code}. {explanation_base}"
        ))
        
        return surtax_amount
