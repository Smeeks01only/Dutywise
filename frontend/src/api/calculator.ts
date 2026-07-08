import axios from 'axios';
import type { CalculatorRequest, CalculationResult } from '../features/calculator/schemas';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for Auth
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const estimateCalculation = async (data: CalculatorRequest): Promise<CalculationResult> => {
  const response = await apiClient.post('/calculations/estimate/', data);
  return response.data;
};

export const saveCalculationEstimate = async (data: CalculatorRequest & { notes?: string }): Promise<CalculationResult> => {
  const response = await apiClient.post('/calculations/save_estimate/', data);
  return response.data;
};

export const getSavedCalculations = async (history: boolean = false) => {
  const response = await apiClient.get(`/calculations/${history ? '?history=true' : ''}`);
  return response.data.results || response.data;
};

export const deleteSavedCalculation = async (id: string) => {
  const response = await apiClient.delete(`/calculations/${id}/`);
  return response.data;
};

export const getCurrencies = async () => {
  const response = await apiClient.get('/customs/currencies/');
  return response.data.results || response.data;
};

export const getCountries = async () => {
  const response = await apiClient.get('/customs/countries/');
  return response.data.results || response.data;
};

export const searchHSCodes = async (query: string) => {
  const response = await apiClient.get(`/customs/hs-codes/?search=${encodeURIComponent(query)}`);
  return response.data.results || response.data;
};

export const searchProducts = async (query: string) => {
  const response = await apiClient.get(`/customs/products/?search=${encodeURIComponent(query)}`);
  return response.data.results || response.data;
};
