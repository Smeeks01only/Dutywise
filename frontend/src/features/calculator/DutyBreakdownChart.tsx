import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CalculateResponse } from '../../hooks/useCalculateDuty';

interface DutyBreakdownChartProps {
  data: CalculateResponse;
}

const COLORS = {
  cif: '#E5E5EA', // very light gray
  duty: '#D1D1D6', // light gray
  surtax: '#C7C7CC', // subtle gray
  excise: '#8E8E93', // muted gray
  vat: '#0071E3', // accent blue for the final tax component
};

export function DutyBreakdownChart({ data }: DutyBreakdownChartProps) {
  const chartData = [
    { name: 'CIF Value', value: parseFloat(data.cif_value), color: COLORS.cif },
  ];

  if (!data.duty_free) {
    if (parseFloat(data.import_duty) > 0) chartData.push({ name: 'Import Duty', value: parseFloat(data.import_duty), color: COLORS.duty });
    if (parseFloat(data.surtax) > 0) chartData.push({ name: 'Surtax', value: parseFloat(data.surtax), color: COLORS.surtax });
    if (parseFloat(data.excise_duty) > 0) chartData.push({ name: 'Excise Duty', value: parseFloat(data.excise_duty), color: COLORS.excise });
    if (parseFloat(data.vat) > 0) chartData.push({ name: 'VAT', value: parseFloat(data.vat), color: COLORS.vat });
  }

  const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="card flex flex-col items-center justify-center min-h-[350px] relative">
      <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider absolute top-6 left-6">
        Total Breakdown
      </h3>
      
      <div className="h-64 w-full mt-8 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={80}
              outerRadius={105}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [formatCurrency(value as number), 'Amount']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-semibold text-neutral-500 uppercase">Grand Total</span>
          <span className="text-2xl font-bold text-neutral-900 mt-1">
            {formatCurrency(parseFloat(data.grand_total))}
          </span>
        </div>
      </div>
    </div>
  );
}
