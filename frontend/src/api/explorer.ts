import { apiClient } from './client'

export interface ExplorerStats {
  hscodes: number;
  products: number;
  categories: number;
  countries: number;
}

export interface CustomsGlossaryTerm {
  id: string;
  term: string;
  definition: string;
  example?: string;
}

export interface TradeAgreement {
  id: string;
  name: string;
  eligibility_rules: string;
  required_certificate: string;
}

export interface GovernmentAgency {
  id: string;
  name: string;
  description: string;
  website: string;
  email: string;
  phone: string;
}

export const explorerApi = {
  getHomeStats: async () => {
    const { data } = await apiClient.get('/explorer/home/')
    return data
  },

  getChapters: async () => {
    const { data } = await apiClient.get('/explorer/hscodes/?level=chapter')
    return data
  },

  getHSCodes: async (params?: any) => {
    const { data } = await apiClient.get('/explorer/hscodes/', { params })
    return data
  },

  getCategories: async (params?: any) => {
    const { data } = await apiClient.get('/explorer/categories/', { params })
    return data
  },

  getProducts: async (params?: any) => {
    const { data } = await apiClient.get('/explorer/products/', { params })
    return data
  },

  getTariffs: async (params?: any) => {
    const { data } = await apiClient.get('/explorer/tariffs/', { params })
    return data
  },

  getRestrictions: async (params?: any) => {
    const { data } = await apiClient.get('/explorer/restrictions/', { params })
    return data
  },

  getAgencies: async (params?: any) => {
    const { data } = await apiClient.get('/explorer/agencies/', { params })
    return data
  },

  getAgreements: async (params?: any) => {
    const { data } = await apiClient.get('/explorer/agreements/', { params })
    return data
  },

  getGlossary: async (params?: any) => {
    const { data } = await apiClient.get('/explorer/glossary/', { params })
    return data
  },

  search: async (query: string) => {
    const { data } = await apiClient.get('/explorer/search/', { params: { q: query } })
    return data
  },

  getBookmarks: async () => {
    const { data } = await apiClient.get('/explorer/bookmarks/')
    return data
  },

  addBookmark: async (payload: { content_type: number, object_id: string, notes?: string }) => {
    const { data } = await apiClient.post('/explorer/bookmarks/', payload)
    return data
  },

  removeBookmark: async (id: string) => {
    await apiClient.delete(`/explorer/bookmarks/${id}/`)
  },

  getRecent: async () => {
    const { data } = await apiClient.get('/explorer/recent/')
    return data
  },

  addRecent: async (payload: { content_type: number, object_id: string }) => {
    const { data } = await apiClient.post('/explorer/recent/', payload)
    return data
  }
}
