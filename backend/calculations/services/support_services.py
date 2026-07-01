from decimal import Decimal
from typing import Optional, Tuple
from .schemas import CalculationRequest
from tariffs.models import TariffRate

class TradeAgreementService:
    @staticmethod
    def apply_agreement(request: CalculationRequest, base_rate: Decimal, tariff_record: TariffRate) -> Tuple[Decimal, Optional[str]]:
        """
        Checks if a trade agreement applies. If so, it might substitute the base_rate.
        Currently, trade agreements are represented as separate TariffRate records where 
        trade_agreement is not null. But if we need to apply logic dynamically, we do it here.
        
        Returns a tuple: (Adjusted Rate, Explanation String)
        """
        if not request.trade_agreement:
            return base_rate, None
            
        # In this data model, trade agreements usually have their own TariffRate row
        # (e.g. HSCode X under SADC has 0% instead of 40%).
        # If the engine passed a tariff_record that ALREADY belongs to the agreement, we just note it.
        if tariff_record.trade_agreement == request.trade_agreement:
            return base_rate, f"Applied preferential rate from {request.trade_agreement.name}."
            
        return base_rate, None

class ExemptionService:
    @staticmethod
    def apply_exemption(request: CalculationRequest, calculated_amount: Decimal, tax_type: str) -> Tuple[Decimal, Optional[str]]:
        """
        Reduces or nullifies taxes based on active DutyExemptions.
        Returns a tuple: (Adjusted Amount, Explanation String)
        """
        if not request.duty_exemption:
            return calculated_amount, None
            
        # Simplistic implementation: most duty exemptions drop the tax to 0. 
        # In a real enterprise system, we'd check if this specific exemption applies to this specific tax_type.
        return Decimal('0.00'), f"Waived due to {request.duty_exemption.name} exemption."
