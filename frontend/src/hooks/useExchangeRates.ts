import { useQuery } from '@tanstack/react-query';
import client from '../api/client';

export interface ExchangeRate {
  id: number;
  base_currency: string;
  target_currency: string;
  rate: string;
  fetched_at: string;
}

export function useExchangeRates() {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const { data } = await client.get<ExchangeRate[]>('/exchange-rates/');
      return data;
    },
    staleTime: 1000 * 60 * 60, // Data is fresh for an hour
  });
}
