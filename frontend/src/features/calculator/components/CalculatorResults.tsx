import React from 'react';
import type { CalculationResult } from '../schemas';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Alert } from '../../../components/ui/alert';
import { AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { CalculationChart } from './CalculationChart';
import { CalculationBreakdown } from './CalculationBreakdown';
import { Button } from '../../../components/ui/button';

interface CalculatorResultsProps {
  result: CalculationResult | null;
  isLoading: boolean;
  onSave?: () => void;
  isSaving?: boolean;
}

export const CalculatorResults: React.FC<CalculatorResultsProps> = ({ result, isLoading, onSave, isSaving }) => {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No Calculation Yet</h3>
          <p className="text-sm">Enter your product details on the left to see an instant estimate of Zimbabwe customs duties.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: result.summary.currency,
    }).format(parseFloat(value));
  };

  return (
    <div className="space-y-6">
      {/* Warnings */}
      {result.metadata.warnings.length > 0 && (
        <div className="space-y-2">
          {result.metadata.warnings.map((warning, idx) => (
            <Alert key={idx} variant="warning" className="bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-900">
              <AlertCircle className="h-4 w-4" />
              <span className="ml-2 font-medium">Warning:</span> {warning}
            </Alert>
          ))}
        </div>
      )}
      
      {/* Success Save */}
      {result.saved_id && (
         <Alert className="bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-900">
           <CheckCircle2 className="h-4 w-4" />
           <span className="ml-2 font-medium">Saved Successfully</span>
         </Alert>
      )}

      {/* Hero Summary */}
      <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg border-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-indigo-100">Estimated Grand Total</CardTitle>
          <CardDescription className="text-indigo-200">CIF + Duties + Taxes + Fees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold tracking-tight">
            {formatCurrency(result.financials.grand_total)}
          </div>
          <div className="mt-4 flex gap-4 text-sm font-medium text-indigo-100">
            <div>
              <span className="opacity-70 block text-xs">Customs Value</span>
              {formatCurrency(result.financials.customs_value)}
            </div>
            <div>
              <span className="opacity-70 block text-xs">Total Taxes</span>
              {formatCurrency((parseFloat(result.financials.grand_total) - parseFloat(result.financials.customs_value)).toString())}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mini Stat Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Import Duty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(result.financials.import_duty)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Value Added Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(result.financials.vat)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <CalculationChart result={result} />
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <CalculationBreakdown result={result} />

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button variant="outline" onClick={() => window.print()}>
          Print Estimate
        </Button>
        {onSave && !result.saved_id && (
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Calculation"}
          </Button>
        )}
      </div>
    </div>
  );
};
