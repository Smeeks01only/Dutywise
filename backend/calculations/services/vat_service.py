from decimal import Decimal
from .schemas import CalculationRequest, CalculationResult, LineItemExplanation
from tariffs.models import TariffRate

class VATService:
    @staticmethod
    def calculate(request: CalculationRequest, result: CalculationResult, vat_basis: Decimal) -> Decimal:
        """
        Calculates Value Added Tax (VAT).
        VAT is typically calculated on the basis of (CIF + Import Duty + Excise Duty + Surtax + Other Applicable Fees).
        """
        tariff = TariffRate.objects.filter(
            hs_code=request.hs_code,
            tariff_type=TariffRate.TariffType.VAT,
            is_current=True,
            status='Active',
            effective_from__lte=request.import_date
        ).order_by('-effective_from').first()
        
        if not tariff:
            return Decimal('0.00')

        vat_amount = Decimal('0.00')
        explanation_base = ""
        
        if tariff.calculation_basis == TariffRate.CalculationBasis.PERCENTAGE and tariff.percentage_rate is not None:
            vat_amount = (vat_basis * tariff.percentage_rate) / Decimal('100.00')
            vat_amount = vat_amount.quantize(Decimal('0.01'))
            explanation_base = f"Calculated at {tariff.percentage_rate}% on a basis of {vat_basis} (Customs Value + Duties + Fees)."
            
        else:
            result.warnings.append(f"Unsupported calculation basis '{tariff.calculation_basis}' for VAT.")
            return Decimal('0.00')

        result.total_vat = vat_amount
        result.explanations.append(LineItemExplanation(
            name="Value Added Tax (VAT)",
            amount=vat_amount,
            explanation=f"Based on HS Code {request.hs_code.code}. {explanation_base}"
        ))
        
        return vat_amount
