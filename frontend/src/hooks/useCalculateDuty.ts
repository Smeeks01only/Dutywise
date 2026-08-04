import { useMutation } from '@tanstack/react-query';
import client from '../api/client';
import { AxiosError } from 'axios';

export interface CalculatePayload {
  hs_code: string;
  product_price: number;
  shipping_cost: number;
  insurance?: number;
  quantity: number;
  currency: string;
}

export interface CalculateResponse {
  hs_code: string;
  product_name: string;
  duty_free: boolean;
  cif_value: string;
  import_duty: string;
  surtax: string;
  excise_duty: string;
  vat: string;
  total_taxes: string;
  grand_total: string;
}

export function useCalculateDuty() {
  return useMutation<CalculateResponse, AxiosError<{ error: string }>, CalculatePayload>({
    mutationFn: async (payload) => {
      const { data } = await client.post<CalculateResponse>('/calculate/', payload);
      return data;
    },
  });
}
