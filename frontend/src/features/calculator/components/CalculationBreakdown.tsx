import React from 'react';
import type { CalculationResult } from '../schemas';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';

interface CalculationBreakdownProps {
  result: CalculationResult;
}

export const CalculationBreakdown: React.FC<CalculationBreakdownProps> = ({ result }) => {
  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: result.summary.currency,
    }).format(typeof value === 'string' ? parseFloat(value) : value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Detailed Breakdown</h3>
      <div className="rounded-md border border-slate-200 dark:border-slate-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Charge Component</TableHead>
              <TableHead>Explanation</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.explanations.map((expl, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{expl.name}</TableCell>
                <TableCell className="text-sm text-slate-600 dark:text-slate-400">{expl.explanation}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(expl.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
