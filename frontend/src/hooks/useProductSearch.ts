import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';

export interface SearchResult {
  code: string;
  name: string;
  category_name: string;
  duty_rate: string;
  vat_applicable: boolean;
  surtax_rate: string | null;
  excise_rate: string | null;
  is_duty_free: boolean;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function useProductSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ['productSearch', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const { data } = await client.get<SearchResult[]>(`/search/?q=${encodeURIComponent(debouncedQuery)}`);
      return data;
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
