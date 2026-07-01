from decimal import Decimal
from .schemas import CalculationRequest, CalculationResult, LineItemExplanation

class CIFService:
    @staticmethod
    def calculate(request: CalculationRequest, result: CalculationResult) -> Decimal:
        """
        Calculates the Customs Value (CIF) in the base currency (USD).
        CIF = (Product Value * Quantity) + Shipping + Insurance
        All values are converted using the resolved exchange rate.
        """
        product_total_foreign = request.product_value * Decimal(request.quantity)
        total_foreign = product_total_foreign + request.shipping_cost + request.insurance_cost
        
        # Convert to USD base currency
        cif_usd = total_foreign * request.exchange_rate
        
        # Round to 2 decimal places (standard financial rounding)
        cif_usd = cif_usd.quantize(Decimal('0.01'))
        
        result.total_customs_value = cif_usd
        
        # Add Explanation
        explanation = (
            f"CIF (Customs Value) calculated as: "
            f"[({request.product_value} * {request.quantity}) + {request.shipping_cost} (Shipping) + {request.insurance_cost} (Insurance)] "
            f"in {request.currency.code}. Converted to USD at a rate of {request.exchange_rate}."
        )
        
        result.explanations.append(LineItemExplanation(
            name="Customs Value (CIF)",
            amount=cif_usd,
            explanation=explanation
        ))
        
        return cif_usd
