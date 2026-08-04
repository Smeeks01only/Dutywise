import { Link } from 'react-router-dom';
import type { CalculateResponse, CalculatePayload } from '../../hooks/useCalculateDuty';
import { useAuth } from '../../hooks/useAuth';
import { useSaveCalculation } from '../../hooks/useCalculations';
import { Button } from '../../components/Button';

interface DutyBreakdownListProps {
  data: CalculateResponse;
  payload: CalculatePayload;
}

export function DutyBreakdownList({ data, payload }: DutyBreakdownListProps) {
  const { isAuthenticated } = useAuth();
  const saveMutation = useSaveCalculation();

  const handleSave = () => {
    saveMutation.mutate({
      hs_code: payload.hs_code,
      input_snapshot: payload,
      result_snapshot: data,
    });
  };

  const formatValue = (val: string) => `$${parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="card flex flex-col h-full min-h-[350px]">
      <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-6">
        Itemized Results
      </h3>

      <div className="flex-1 flex flex-col gap-4">
        {/* Product Details */}
        <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
          <div className="flex flex-col">
            <span className="text-sm text-neutral-500">Product (HS Code)</span>
            <span className="font-semibold text-neutral-900">{data.product_name}</span>
          </div>
          <span className="font-mono text-sm text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
            {data.hs_code}
          </span>
        </div>

        {/* Breakdown Items */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-neutral-600">
            <span>Base CIF Value</span>
            <span className="font-medium text-neutral-900">{formatValue(data.cif_value)}</span>
          </div>

          {data.duty_free ? (
            <div className="mt-2 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-700 font-semibold text-sm">✓ Duty-Free Item</span>
            </div>
          ) : (
            <>
              {parseFloat(data.import_duty) > 0 && (
                <div className="flex justify-between items-center text-neutral-600 text-sm">
                  <span>Import Duty</span>
                  <span className="font-medium text-neutral-900">{formatValue(data.import_duty)}</span>
                </div>
              )}
              {parseFloat(data.surtax) > 0 && (
                <div className="flex justify-between items-center text-neutral-600 text-sm">
                  <span>Surtax</span>
                  <span className="font-medium text-neutral-900">{formatValue(data.surtax)}</span>
                </div>
              )}
              {parseFloat(data.excise_duty) > 0 && (
                <div className="flex justify-between items-center text-neutral-600 text-sm">
                  <span>Excise Duty</span>
                  <span className="font-medium text-neutral-900">{formatValue(data.excise_duty)}</span>
                </div>
              )}
              {parseFloat(data.vat) > 0 && (
                <div className="flex justify-between items-center text-neutral-600 text-sm">
                  <span>VAT</span>
                  <span className="font-medium text-neutral-900">{formatValue(data.vat)}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Totals Section */}
      <div className="mt-6 pt-4 border-t-2 border-neutral-100 flex flex-col gap-3">
        <div className="flex justify-between items-center text-primary-700 font-semibold">
          <span>Total Taxes</span>
          <span>{formatValue(data.total_taxes)}</span>
        </div>
        
        <div className="flex justify-between items-center bg-neutral-900 text-white p-4 rounded-xl shadow-md mt-2">
          <span className="text-lg font-bold">Grand Total</span>
          <span className="text-2xl font-bold tracking-tight">{formatValue(data.grand_total)}</span>
        </div>
      </div>

      {/* Save Action Area */}
      <div className="mt-6 pt-6 border-t border-neutral-100">
        {isAuthenticated ? (
          saveMutation.isSuccess ? (
            <div className="flex items-center justify-center p-3 text-sm font-medium text-green-700 bg-green-50 border border-green-100 rounded-lg">
              ✓ Saved to history
            </div>
          ) : (
            <Button 
              className="w-full" 
              onClick={handleSave} 
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Saving...' : 'Save this calculation'}
            </Button>
          )
        ) : (
          <div className="text-center text-sm">
            <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
              Log in to save your calculations
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
