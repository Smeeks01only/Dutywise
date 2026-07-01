import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface SearchResults {
  products: any[];
  hs_codes: any[];
  categories: any[];
}

export const globalSearch = async (query: string): Promise<SearchResults> => {
  const response = await apiClient.get(`/v1/search/?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const getProducts = async (params: any = {}) => {
  const searchParams = new URLSearchParams(params).toString();
  const response = await apiClient.get(`/v1/products/?${searchParams}`);
  return response.data;
};

export const getProduct = async (id: string) => {
  const response = await apiClient.get(`/v1/products/${id}/`);
  return response.data;
};

export const getHSCodes = async (params: any = {}) => {
  const searchParams = new URLSearchParams(params).toString();
  const response = await apiClient.get(`/v1/hs-codes/?${searchParams}`);
  return response.data;
};

export const getHSCode = async (id: string) => {
  const response = await apiClient.get(`/v1/hs-codes/${id}/`);
  return response.data;
};

export const getCategories = async (params: any = {}) => {
  const searchParams = new URLSearchParams(params).toString();
  const response = await apiClient.get(`/v1/categories/?${searchParams}`);
  return response.data;
};

export const getCategory = async (id: string) => {
  const response = await apiClient.get(`/v1/categories/${id}/`);
  return response.data;
};
