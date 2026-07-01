import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CalculatorForm, CalculatorResults } from '../features/calculator';
import type { CalculatorRequest, CalculationResult } from '../features/calculator';
import { estimateCalculation, saveCalculationEstimate } from '../api/calculator';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export function CalculatorPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [lastRequest, setLastRequest] = useState<CalculatorRequest | null>(null);

  const estimateMutation = useMutation({
    mutationFn: estimateCalculation,
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to calculate duty estimate');
    }
  });

  const saveMutation = useMutation({
    mutationFn: saveCalculationEstimate,
    onSuccess: (data) => {
      setResult(data);
      toast.success('Calculation saved successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to save calculation');
    }
  });

  const handleCalculate = (data: CalculatorRequest) => {
    setLastRequest(data);
    estimateMutation.mutate(data);
  };

  const handleSave = () => {
    if (!user) {
      toast.error('You must be logged in to save calculations');
      return;
    }
    if (lastRequest) {
      saveMutation.mutate(lastRequest);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Duty Calculator</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Estimate Zimbabwe import duties, VAT, and surtaxes instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Input Form */}
        <div className="lg:col-span-5 h-full">
          <CalculatorForm 
            onCalculate={handleCalculate} 
            isLoading={estimateMutation.isPending}
          />
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-7">
          <CalculatorResults 
            result={result} 
            isLoading={estimateMutation.isPending} 
            onSave={handleSave}
            isSaving={saveMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
