import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import type { CalculatePayload, CalculateResponse } from './useCalculateDuty';

export interface SavedCalculation {
  id: number;
  hs_code: number | string;
  hs_code_name?: string; // From backend if provided via serializer
  input_snapshot: CalculatePayload;
  result_snapshot: CalculateResponse;
  created_at: string;
}

export function useCalculations() {
  return useQuery({
    queryKey: ['calculations'],
    queryFn: async () => {
      const { data } = await client.get<SavedCalculation[]>('/calculations/');
      return data;
    },
  });
}

export function useSaveCalculation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { hs_code: string; input_snapshot: CalculatePayload; result_snapshot: CalculateResponse }) => {
      const { data } = await client.post('/calculations/', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculations'] });
    },
  });
}

export function useDeleteCalculation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/calculations/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculations'] });
    },
  });
}
