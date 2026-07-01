from .schemas import CalculationRequest, CalculationResult
from .validation_service import ValidationService
from .cif_service import CIFService
from .duty_service import DutyService
from .excise_service import ExciseService
from .surtax_service import SurtaxService
from .carbon_tax_service import CarbonTaxService
from .fees_service import FeesService
from .vat_service import VATService
from decimal import Decimal

class DutyCalculationEngine:
    """
    The orchestrator for computing duty and tax estimations.
    """
    @classmethod
    def calculate(cls, request: CalculationRequest) -> CalculationResult:
        # 1. Validation & Resolution
        ValidationService.validate_request(request)
        request.exchange_rate = ValidationService.resolve_exchange_rate(request)
        
        # 2. Initialization
        result = CalculationResult(
            hs_code_str=request.hs_code.code,
            product_name=request.product.name if request.product else None,
            currency_code=request.currency.code,
            exchange_rate_used=request.exchange_rate,
            import_date=request.import_date
        )
        
        # 3. Pipeline
        # Step A: Customs Value (CIF)
        cif_usd = CIFService.calculate(request, result)
        
        # Step B: Base Duties
        import_duty = DutyService.calculate(request, result, cif_usd)
        
        # Step C: Excise & Surtax
        excise = ExciseService.calculate(request, result, cif_usd)
        surtax = SurtaxService.calculate(request, result, cif_usd, import_duty)
        
        # Step D: Carbon Tax & Fees
        carbon_tax = CarbonTaxService.calculate(request, result)
        other_charges = FeesService.calculate(request, result)
        
        # Step E: VAT
        # VAT Basis is usually CIF + Import Duty + Excise + Surtax + Other Charges + Carbon Tax
        vat_basis = cif_usd + import_duty + excise + surtax + carbon_tax + other_charges
        vat = VATService.calculate(request, result, vat_basis)
        
        # Step F: Grand Total
        result.grand_total = vat_basis + vat
        
        return result
