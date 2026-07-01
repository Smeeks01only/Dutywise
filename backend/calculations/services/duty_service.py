from decimal import Decimal
from .schemas import CalculationRequest, CalculationResult, LineItemExplanation
from tariffs.models import TariffRate
from .support_services import TradeAgreementService, ExemptionService

class DutyService:
    @staticmethod
    def calculate(request: CalculationRequest, result: CalculationResult, cif_usd: Decimal) -> Decimal:
        """
        Calculates Import Duty based on HS Code and Country of Origin.
        Applies Trade Agreements and Exemptions if applicable.
        """
        qs = TariffRate.objects.filter(
            hs_code=request.hs_code,
            tariff_type=TariffRate.TariffType.IMPORT_DUTY,
            is_current=True,
            status='Active',
            effective_from__lte=request.import_date
        )
        
        # 1. Check for Country + Trade Agreement Match
        tariff = None
        if request.country_of_origin and request.trade_agreement:
            tariff = qs.filter(country=request.country_of_origin, trade_agreement=request.trade_agreement).order_by('-effective_from').first()
            
        # 2. Check for Country Match
        if not tariff and request.country_of_origin:
            tariff = qs.filter(country=request.country_of_origin, trade_agreement__isnull=True).order_by('-effective_from').first()
            
        # 3. Fallback to Global (no country specified)
        if not tariff:
            tariff = qs.filter(country__isnull=True, trade_agreement__isnull=True).order_by('-effective_from').first()
            
        if not tariff:
            result.warnings.append(f"No active Import Duty rate found for HS Code {request.hs_code.code}.")
            return Decimal('0.00')

        # Calculate base amount
        duty_amount = Decimal('0.00')
        explanation_base = ""
        
        if tariff.calculation_basis == TariffRate.CalculationBasis.PERCENTAGE and tariff.percentage_rate is not None:
            # Adjust rate based on trade agreements
            rate, agreement_note = TradeAgreementService.apply_agreement(request, tariff.percentage_rate, tariff)
            
            duty_amount = (cif_usd * rate) / Decimal('100.00')
            duty_amount = duty_amount.quantize(Decimal('0.01'))
            
            explanation_base = f"Calculated at {rate}% of CIF ({cif_usd})."
            if agreement_note:
                explanation_base += f" {agreement_note}"
                result.trade_agreement_applied = request.trade_agreement.name if request.trade_agreement else None
                
        elif tariff.calculation_basis == TariffRate.CalculationBasis.QUANTITY and tariff.fixed_amount is not None:
            duty_amount = tariff.fixed_amount * Decimal(request.quantity)
            duty_amount = duty_amount.quantize(Decimal('0.01'))
            explanation_base = f"Calculated as Fixed Fee of {tariff.fixed_amount} * {request.quantity} units."
            
        else:
            result.warnings.append(f"Unsupported calculation basis '{tariff.calculation_basis}' for Import Duty.")
            return Decimal('0.00')

        # Apply Exemptions
        final_duty, exemption_note = ExemptionService.apply_exemption(request, duty_amount, 'IMPORT_DUTY')
        
        if exemption_note:
            explanation_base += f" {exemption_note}"
            result.exemptions_applied = request.duty_exemption.name if request.duty_exemption else None

        result.total_import_duty = final_duty
        result.explanations.append(LineItemExplanation(
            name="Import Duty",
            amount=final_duty,
            explanation=f"Based on HS Code {request.hs_code.code}. {explanation_base}"
        ))
        
        return final_duty
