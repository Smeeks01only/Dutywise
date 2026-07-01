import { z } from 'zod';

// The input request for the Calculation Engine
export const calculatorRequestSchema = z.object({
  product_value: z.number().min(0.01, { message: "Product value must be at least 0.01" }),
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
  shipping_cost: z.number().min(0, { message: "Shipping cost cannot be negative" }).default(0),
  insurance_cost: z.number().min(0, { message: "Insurance cost cannot be negative" }).default(0),
  currency_code: z.string().min(3, { message: "Currency is required" }),
  
  hs_code: z.string().optional(),
  product_id: z.string().uuid().optional(),
  
  country_iso: z.string().optional(),
  trade_agreement_id: z.string().uuid().optional(),
  duty_exemption_id: z.string().uuid().optional(),
}).refine(data => data.hs_code || data.product_id, {
  message: "Either a Product or HS Code must be selected",
  path: ["hs_code"]
});

export type CalculatorRequest = z.infer<typeof calculatorRequestSchema>;

// The response from the Calculation Engine
export interface CalculationExplanation {
  name: string;
  amount: string;
  explanation: string;
}

export interface CalculationResult {
  summary: {
    hs_code: string;
    product_name: string | null;
    currency: string;
    exchange_rate: string;
    import_date: string;
  };
  financials: {
    customs_value: string;
    import_duty: string;
    excise: string;
    surtax: string;
    carbon_tax: string;
    other_charges: string;
    vat: string;
    grand_total: string;
  };
  explanations: CalculationExplanation[];
  metadata: {
    trade_agreement: string | null;
    exemptions: string | null;
    warnings: string[];
    errors: string[];
  };
  saved_id?: string;
}
