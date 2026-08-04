import { useState } from 'react';
import type { FormEvent } from 'react';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { Loader2, Calculator, DollarSign, Package, Globe2, AlertCircle, Truck, Shield, TrendingUp } from 'lucide-react';
import { useCalculateDuty } from '../hooks/useCalculateDuty';
import type { CalculatePayload } from '../hooks/useCalculateDuty';
import { DutyBreakdownChart } from '../features/calculator/DutyBreakdownChart';
import { DutyBreakdownList } from '../features/calculator/DutyBreakdownList';
import { ProductSearchInput } from '../features/calculator/ProductSearchInput';
import { LiveExchangeRates } from '../features/calculator/LiveExchangeRates';
import type { SelectOption } from '../components/Select';

const CURRENCY_OPTIONS: SelectOption[] = [
  { value: 'USD', label: 'USD - US Dollar', icon: '🇺🇸' },
  { value: 'ZWG', label: 'ZWG - ZiG', icon: '🇿🇼' },
  { value: 'ZAR', label: 'ZAR - Rand', icon: '🇿🇦' },
  { value: 'GBP', label: 'GBP - Pound', icon: '🇬🇧' },
];

export default function Dashboard() {
  const mutation = useCalculateDuty();

  // Form State
  const [formData, setFormData] = useState<CalculatePayload>({
    hs_code: '',
    product_price: 0,
    shipping_cost: 0,
    insurance: 0,
    quantity: 1,
    currency: 'USD',
  });
  const [searchDisplayValue, setSearchDisplayValue] = useState('');

  // Validation State
  const [errors, setErrors] = useState<Partial<Record<keyof CalculatePayload, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CalculatePayload, string>> = {};

    if (!formData.hs_code.trim()) newErrors.hs_code = 'HS Code is required';
    if (formData.product_price <= 0) newErrors.product_price = 'Price must be greater than 0';
    if (formData.shipping_cost < 0) newErrors.shipping_cost = 'Shipping cannot be negative';
    if (formData.insurance && formData.insurance < 0) newErrors.insurance = 'Insurance cannot be negative';
    if (formData.quantity <= 0) newErrors.quantity = 'Quantity must be at least 1';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      mutation.mutate(formData);
    }
  };

  const handleChange = (field: keyof CalculatePayload, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error on type
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Input Section */}
      <section>
        <div className="flex justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-800 tracking-tight">Duty Calculator</h1>
            <p className="text-neutral-500 mt-2 font-medium">Estimate your total landed cost before you import.</p>
          </div>
          <a href="#exchange-rates" className="hidden sm:flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-100 transition-colors">
            <TrendingUp className="h-4 w-4" />
            Live Exchange Rates
          </a>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <ProductSearchInput
                label="Product / HS Code"
                value={searchDisplayValue}
                onSelectProduct={(code, name) => {
                  setFormData((prev) => ({ ...prev, hs_code: code }));
                  setSearchDisplayValue(name);
                  if (errors.hs_code) setErrors((prev) => ({ ...prev, hs_code: undefined }));
                }}
                onClear={() => {
                  setFormData((prev) => ({ ...prev, hs_code: '' }));
                  setSearchDisplayValue('');
                }}
                error={errors.hs_code}
              />

              <Input
                label="Product Price"
                type="number"
                min="0"
                step="0.01"
                icon={<DollarSign className="h-4 w-4" />}
                value={formData.product_price || ''}
                onChange={(e) => handleChange('product_price', parseFloat(e.target.value) || 0)}
                error={errors.product_price}
                required
              />

              <Input
                label="Shipping Cost"
                type="number"
                min="0"
                step="0.01"
                icon={<Truck className="h-4 w-4" />}
                value={formData.shipping_cost || ''}
                onChange={(e) => handleChange('shipping_cost', parseFloat(e.target.value) || 0)}
                error={errors.shipping_cost}
                required
              />

              <Input
                label="Insurance (Optional)"
                type="number"
                min="0"
                step="0.01"
                icon={<Shield className="h-4 w-4" />}
                value={formData.insurance || ''}
                onChange={(e) => handleChange('insurance', parseFloat(e.target.value) || 0)}
                error={errors.insurance}
              />

              <Input
                label="Quantity"
                type="number"
                min="1"
                step="1"
                icon={<Package className="h-4 w-4" />}
                value={formData.quantity || ''}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value, 10) || 1)}
                error={errors.quantity}
                required
              />

              <Select
                label="Currency"
                icon={<Globe2 className="h-4 w-4" />}
                value={formData.currency}
                onChange={(val) => handleChange('currency', val.toString())}
                options={CURRENCY_OPTIONS}
                error={errors.currency}
              />
            </div>

            {/* API Error State */}
            {mutation.isError && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
                <AlertCircle size={20} />
                <span className="font-medium">
                  {mutation.error?.response?.data?.error || 'An unexpected error occurred while calculating duty.'}
                </span>
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-lg mt-2 shadow-sm" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-5 w-5" />
                  Calculate Duty
                </>
              )}
            </Button>
          </form>
        </Card>

        <div id="exchange-rates" className="mt-8 scroll-mt-6">
          <LiveExchangeRates />
        </div>
      </section>

      {/* Results Section */}
      {mutation.isSuccess && mutation.data && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DutyBreakdownChart data={mutation.data} />
            <DutyBreakdownList data={mutation.data} payload={formData} />
          </div>
        </section>
      )}
    </div>
  );
}
