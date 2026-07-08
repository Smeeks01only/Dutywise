import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSavedCalculations, deleteSavedCalculation } from '../../api/calculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader2, Trash2, Calculator, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export function SavedCalculationsPage() {
  const queryClient = useQueryClient();

  const { data: calculations, isLoading } = useQuery({
    queryKey: ['savedCalculations'],
    queryFn: getSavedCalculations,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSavedCalculation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedCalculations'] });
      toast.success('Saved calculation deleted');
    },
    onError: () => {
      toast.error('Failed to delete calculation');
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatCurrency = (amount: string | number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Saved Calculations</h1>
        <p className="text-muted-foreground mt-2">
          View your previously saved duty and tax estimates.
        </p>
      </div>

      {calculations?.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="mb-2">No Saved Calculations</CardTitle>
            <CardDescription className="mb-6">
              You haven't saved any calculations yet. Try running an estimate and saving it.
            </CardDescription>
            <Button asChild>
              <Link to="/calculator">
                Go to Calculator <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {calculations?.map((calc: any) => (
            <Card key={calc.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg line-clamp-1">
                      {calc.product_name || calc.hs_code_str || "Custom Calculation"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {formatDate(calc.created_at)}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-50 -mr-2 -mt-2"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this calculation?')) {
                        deleteMutation.mutate(calc.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product Value</span>
                    <span className="font-medium">{formatCurrency(calc.product_price, calc.currency_code)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Taxes</span>
                    <span className="font-medium text-amber-600">
                      {formatCurrency(parseFloat(calc.grand_total) - parseFloat(calc.total_customs_value), "USD")}
                    </span>
                  </div>
                  <div className="pt-2 mt-2 border-t flex justify-between items-center">
                    <span className="font-semibold text-foreground">Grand Total</span>
                    <span className="font-bold text-primary text-lg">
                      {formatCurrency(calc.grand_total, "USD")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
