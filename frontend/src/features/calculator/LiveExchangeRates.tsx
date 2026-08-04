import { useExchangeRates } from '../../hooks/useExchangeRates';
import { TrendingUp, ArrowRight, ArrowUpRight } from 'lucide-react';

// Helper to map currency codes to flag emojis
const getFlagForCurrency = (currencyCode: string) => {
  const flags: Record<string, string> = {
    'USD': '🇺🇸',
    'ZWG': '🇿🇼',
    'ZAR': '🇿🇦',
    'GBP': '🇬🇧',
    'EUR': '🇪🇺',
  };
  return flags[currencyCode] || '🏳️';
};

// Helper to get currency full name
const getCurrencyName = (currencyCode: string) => {
  const names: Record<string, string> = {
    'USD': 'US Dollar',
    'ZWG': 'ZiG',
    'ZAR': 'Rand',
    'GBP': 'Pound',
    'EUR': 'Euro',
  };
  return names[currencyCode] || currencyCode;
};

export function LiveExchangeRates() {
  const { data: rates, isLoading, isError } = useExchangeRates();

  if (isLoading || isError || !rates || rates.length === 0) {
    return null; // Fail gracefully by showing nothing if data isn't ready or fails
  }

  return (
    <div className="w-full bg-primary-50 p-6 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          <h2 className="text-base font-semibold text-neutral-900">Live Exchange Rates</h2>
        </div>
        <a href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors">
          View all rates <ArrowRight className="h-4 w-4" />
        </a>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rates.map((rate) => {
          // Placeholder trend data (since backend doesn't provide historical delta yet)
          // TODO: Replace with real trend data when available
          const placeholderTrend = "+0.12%"; 

          return (
            <div 
              key={`${rate.base_currency}-${rate.target_currency}`}
              className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-neutral-50 flex items-center justify-center text-2xl border border-neutral-100">
                  {getFlagForCurrency(rate.target_currency)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-0.5">
                    {rate.target_currency} - {getCurrencyName(rate.target_currency)}
                  </p>
                  <p className="text-lg font-bold text-neutral-900 leading-none">
                    {Number(rate.rate).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                <ArrowUpRight className="h-3 w-3" />
                {placeholderTrend}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
