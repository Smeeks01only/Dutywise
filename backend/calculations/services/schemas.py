from dataclasses import dataclass, field
from typing import List, Optional, Dict
from decimal import Decimal
from datetime import date
from core.models import Country, Currency
from products.models import Product, HSCode
from customs.models import TradeAgreement, DutyExemption

@dataclass
class LineItemExplanation:
    """Stores the explanation and amount for a specific tax calculation step."""
    name: str
    amount: Decimal
    explanation: str

@dataclass
class CalculationRequest:
    """Input parameters for the Duty Calculation Engine."""
    product_value: Decimal
    quantity: int
    shipping_cost: Decimal
    insurance_cost: Decimal
    currency: Currency
    
    # At least one must be provided (product or hs_code)
    hs_code: Optional[HSCode] = None
    product: Optional[Product] = None
    
    country_of_origin: Optional[Country] = None
    trade_agreement: Optional[TradeAgreement] = None
    duty_exemption: Optional[DutyExemption] = None
    
    import_date: date = field(default_factory=date.today)
    
    # Internal resolved fields
    exchange_rate: Decimal = Decimal('1.00')
    
    def __post_init__(self):
        # Resolve HS code if only product was provided
        if self.product and not self.hs_code:
            self.hs_code = self.product.hs_code
            
        # Resolve country if only product has default
        if self.product and not self.country_of_origin and self.product.default_country:
            self.country_of_origin = self.product.default_country

@dataclass
class CalculationResult:
    """Output structure of the Duty Calculation Engine."""
    # Summary of inputs
    hs_code_str: str
    product_name: Optional[str]
    currency_code: str
    exchange_rate_used: Decimal
    import_date: date
    
    # Financials
    total_customs_value: Decimal = Decimal('0.00') # CIF in base currency
    total_import_duty: Decimal = Decimal('0.00')
    total_excise: Decimal = Decimal('0.00')
    total_surtax: Decimal = Decimal('0.00')
    total_carbon_tax: Decimal = Decimal('0.00')
    other_charges: Decimal = Decimal('0.00')
    total_vat: Decimal = Decimal('0.00')
    grand_total: Decimal = Decimal('0.00')
    
    # Detailed line items and explanations
    explanations: List[LineItemExplanation] = field(default_factory=list)
    
    # Processing Metadata
    trade_agreement_applied: Optional[str] = None
    exemptions_applied: Optional[str] = None
    warnings: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    
    def to_dict(self):
        """Converts the dataclass to a dictionary for API response."""
        return {
            "summary": {
                "hs_code": self.hs_code_str,
                "product_name": self.product_name,
                "currency": self.currency_code,
                "exchange_rate": str(self.exchange_rate_used),
                "import_date": self.import_date.isoformat()
            },
            "financials": {
                "customs_value": str(self.total_customs_value),
                "import_duty": str(self.total_import_duty),
                "excise": str(self.total_excise),
                "surtax": str(self.total_surtax),
                "carbon_tax": str(self.total_carbon_tax),
                "other_charges": str(self.other_charges),
                "vat": str(self.total_vat),
                "grand_total": str(self.grand_total)
            },
            "explanations": [
                {
                    "name": expl.name,
                    "amount": str(expl.amount),
                    "explanation": expl.explanation
                } for expl in self.explanations
            ],
            "metadata": {
                "trade_agreement": self.trade_agreement_applied,
                "exemptions": self.exemptions_applied,
                "warnings": self.warnings,
                "errors": self.errors
            }
        }
