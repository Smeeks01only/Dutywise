import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import type { CalculatorRequest } from '../schemas';
import { calculatorRequestSchema } from '../schemas';
import { getCurrencies, getCountries } from '../../../api/calculator';
import { ProductSearchAutocomplete } from './ProductSearchAutocomplete';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';

interface CalculatorFormProps {
  onCalculate: (data: CalculatorRequest) => void;
  isLoading: boolean;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({ onCalculate, isLoading }) => {
  const { data: currencies = [] } = useQuery({ queryKey: ['currencies'], queryFn: getCurrencies });
  const { data: countries = [] } = useQuery({ queryKey: ['countries'], queryFn: getCountries });

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<CalculatorRequest>({
    resolver: zodResolver(calculatorRequestSchema) as any,
    defaultValues: {
      product_value: 0,
      quantity: 1,
      shipping_cost: 0,
      insurance_cost: 0,
      currency_code: 'USD',
      country_iso: '',
    }
  });

  const onSubmit = (data: CalculatorRequest) => {
    onCalculate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Search for your product to find the HS Code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Search Product or HS Code</Label>
            <ProductSearchAutocomplete 
              onSelectProduct={(p) => {
                setValue('product_id', p.id);
                if (p.hs_code) setValue('hs_code', p.hs_code.code);
              }}
              onSelectHSCode={(hs) => {
                setValue('hs_code', hs.code);
                setValue('product_id', undefined);
              }}
              error={errors.hs_code?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country_iso">Country of Origin (Optional)</Label>
            <Controller
              name="country_iso"
              control={control}
              render={({ field }) => (
                <select 
                  {...field}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950"
                >
                  <option value="">Select a country...</option>
                  {countries.map((c: any) => (
                    <option key={c.iso_code} value={c.iso_code}>{c.name}</option>
                  ))}
                </select>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing & Values</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency_code">Currency</Label>
              <Controller
                name="currency_code"
                control={control}
                render={({ field }) => (
                  <select 
                    {...field}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950"
                  >
                    {currencies.map((c: any) => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                )}
              />
              {errors.currency_code && <p className="text-xs text-red-500">{errors.currency_code.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Controller
                name="quantity"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <Input 
                    type="number" 
                    min="1" 
                    {...field} 
                    value={value || ''}
                    onChange={e => onChange(e.target.value ? parseInt(e.target.value) : 0)} 
                  />
                )}
              />
              {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_value">Product Value</Label>
            <Controller
              name="product_value"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <Input 
                  type="number" 
                  step="0.01"
                  {...field} 
                  value={value || ''}
                  onChange={e => onChange(e.target.value ? parseFloat(e.target.value) : 0)} 
                />
              )}
            />
            {errors.product_value && <p className="text-xs text-red-500">{errors.product_value.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shipping_cost">Shipping Cost</Label>
              <Controller
                name="shipping_cost"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <Input 
                    type="number" 
                    step="0.01"
                    {...field} 
                    value={value || ''}
                    onChange={e => onChange(e.target.value ? parseFloat(e.target.value) : 0)} 
                  />
                )}
              />
              {errors.shipping_cost && <p className="text-xs text-red-500">{errors.shipping_cost.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="insurance_cost">Insurance Cost</Label>
              <Controller
                name="insurance_cost"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <Input 
                    type="number" 
                    step="0.01"
                    {...field} 
                    value={value || ''}
                    onChange={e => onChange(e.target.value ? parseFloat(e.target.value) : 0)} 
                  />
                )}
              />
              {errors.insurance_cost && <p className="text-xs text-red-500">{errors.insurance_cost.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Calculating...' : 'Calculate Duties'}
      </Button>
    </form>
  );
};
