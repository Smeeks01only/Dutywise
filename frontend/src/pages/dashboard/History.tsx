import { useQuery } from '@tanstack/react-query';
import { getSavedCalculations } from '../../api/calculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Loader2, History as HistoryIcon, ArrowRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';

export function HistoryPage() {
  // Pass history=true to get all calculations, not just explicitly saved ones
  const { data: calculations, isLoading } = useQuery({
    queryKey: ['savedCalculations', 'history'],
    queryFn: () => getSavedCalculations(true),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatCurrency = (amount: string | number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calculation History</h1>
        <p className="text-muted-foreground mt-2">
          A complete log of every duty estimation you have run.
        </p>
      </div>

      {calculations?.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <HistoryIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="mb-2">No History Yet</CardTitle>
            <CardDescription className="mb-6">
              You haven't run any calculations yet. Give the duty calculator a try!
            </CardDescription>
            <Button asChild>
              <Link to="/calculator">
                Go to Calculator <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Product / HS Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Product Value</TableHead>
                  <TableHead className="text-right">Duty & Taxes</TableHead>
                  <TableHead className="text-right font-bold">Grand Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculations?.map((calc: any) => (
                  <TableRow key={calc.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(calc.created_at)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {calc.product_name || calc.hs_code_str || "Custom"}
                    </TableCell>
                    <TableCell>
                      {calc.is_explicitly_saved ? (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400">
                          Saved
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400">
                          Auto-logged
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(calc.product_price, calc.currency_code)}
                    </TableCell>
                    <TableCell className="text-right text-amber-600">
                      {formatCurrency(parseFloat(calc.grand_total) - parseFloat(calc.total_customs_value), "USD")}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {formatCurrency(calc.grand_total, "USD")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
