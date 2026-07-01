from decimal import Decimal
from .schemas import CalculationRequest, CalculationResult, LineItemExplanation
from tariffs.models import TariffRate

class FeesService:
    @staticmethod
    def calculate(request: CalculationRequest, result: CalculationResult) -> Decimal:
        """
        Calculates Other Government Charges (Processing Fees, Inspection, etc).
        Iterates over all applicable OTHER fees for the HS code.
        """
        tariffs = TariffRate.objects.filter(
            hs_code=request.hs_code,
            tariff_type__in=[TariffRate.TariffType.PROCESSING_FEE, TariffRate.TariffType.OTHER],
            is_current=True,
            status='Active',
            effective_from__lte=request.import_date
        )
        
        total_fees = Decimal('0.00')
        
        for tariff in tariffs:
            fee_amount = Decimal('0.00')
            explanation_base = ""
            
            if tariff.calculation_basis == TariffRate.CalculationBasis.QUANTITY and tariff.fixed_amount is not None:
                fee_amount = tariff.fixed_amount * Decimal(request.quantity)
                fee_amount = fee_amount.quantize(Decimal('0.01'))
                explanation_base = f"Calculated as Fixed Fee of {tariff.fixed_amount} * {request.quantity} units."
                
            elif tariff.calculation_basis == TariffRate.CalculationBasis.FLAT_FEE and tariff.fixed_amount is not None:
                fee_amount = tariff.fixed_amount
                fee_amount = fee_amount.quantize(Decimal('0.01'))
                explanation_base = f"Calculated as Flat Fee of {tariff.fixed_amount}."
            else:
                continue

            total_fees += fee_amount
            result.explanations.append(LineItemExplanation(
                name=f"{tariff.get_tariff_type_display()}",
                amount=fee_amount,
                explanation=f"Based on HS Code {request.hs_code.code}. {explanation_base}"
            ))
            
        result.other_charges = total_fees
        return total_fees
