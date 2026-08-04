import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useCalculations, useDeleteCalculation } from '../hooks/useCalculations';
import { Loader2, Trash2, Calendar, FileText, AlertTriangle } from 'lucide-react';

export default function History() {
  const { data: calculations, isLoading, isError } = useCalculations();
  const deleteMutation = useDeleteCalculation();
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const formatCurrency = (val: string | number) => `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setConfirmDeleteId(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-4" />
        <p className="text-neutral-500">Loading your history...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Failed to load history</h2>
        <p className="text-neutral-500">There was an error fetching your saved calculations.</p>
      </div>
    );
  }

  if (!calculations || calculations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-primary-50 p-4 rounded-full mb-6">
          <FileText className="h-10 w-10 text-primary-500" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">No calculations saved yet</h2>
        <p className="text-neutral-500 max-w-md mx-auto mb-8">
          Your saved import duty estimates will appear here so you can reference them later.
        </p>
        <Link to="/">
          <Button>Start Calculating</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Saved Calculations</h1>
        <p className="text-neutral-500 mt-1">Review your previously estimated import duties.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calculations.map((calc) => (
          <Card key={calc.id} className="flex flex-col relative group hover:shadow-md transition-shadow">
            
            {/* Delete State Overlay */}
            {confirmDeleteId === calc.id && (
              <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                <p className="text-neutral-900 font-semibold mb-4">Delete this calculation?</p>
                <div className="flex gap-3 w-full">
                  <Button variant="secondary" onClick={() => setConfirmDeleteId(null)} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleDelete(calc.id)} 
                    className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Delete'}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Calendar className="h-4 w-4" />
                <span>{new Date(calc.created_at).toLocaleDateString()}</span>
              </div>
              <button 
                onClick={() => setConfirmDeleteId(calc.id)}
                className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                aria-label="Delete calculation"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 mb-6">
              <h3 className="font-semibold text-neutral-900 text-lg mb-1 truncate" title={calc.result_snapshot.product_name}>
                {calc.result_snapshot.product_name}
              </h3>
              <p className="font-mono text-xs text-neutral-500 bg-neutral-100 inline-block px-1.5 py-0.5 rounded">
                {calc.result_snapshot.hs_code}
              </p>
            </div>

            <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-neutral-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Base CIF</span>
                <span className="font-medium text-neutral-700">{formatCurrency(calc.result_snapshot.cif_value)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-900">Grand Total</span>
                <span className="text-lg font-bold text-primary-600 tracking-tight">
                  {formatCurrency(calc.result_snapshot.grand_total)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
