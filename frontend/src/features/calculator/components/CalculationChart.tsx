import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { CalculationResult } from '../schemas';

interface CalculationChartProps {
  result: CalculationResult;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const CalculationChart: React.FC<CalculationChartProps> = ({ result }) => {
  const data = [
    { name: 'Product Cost (CIF)', value: parseFloat(result.financials.customs_value) },
    { name: 'Import Duty', value: parseFloat(result.financials.import_duty) },
    { name: 'VAT', value: parseFloat(result.financials.vat) },
    { name: 'Excise Duty', value: parseFloat(result.financials.excise) },
    { name: 'Surtax', value: parseFloat(result.financials.surtax) },
    { name: 'Other Charges', value: parseFloat(result.financials.other_charges) },
  ].filter(item => item.value > 0);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: result.summary.currency }).format(Number(value))}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
