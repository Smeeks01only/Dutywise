import { apiClient } from './client'
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
})

export type LoginCredentials = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  country: z.string().min(2, "Country is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export type RegisterCredentials = z.infer<typeof registerSchema>

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  country: string
  profile_picture: string | null
  preferred_currency: string
  preferred_theme: string
  email_verified: boolean
  is_staff: boolean
  profile?: any
}

export interface AuthResponse {
  access: string
  refresh: string
  user: User
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login/', {
      email: credentials.email,
      password: credentials.password
    })
    return data
  },
  
  register: async (credentials: RegisterCredentials) => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register/', {
      first_name: credentials.firstName,
      last_name: credentials.lastName,
      email: credentials.email,
      country: credentials.country,
      password: credentials.password,
      password_confirm: credentials.confirmPassword
    })
    return data
  },

  logout: async (refreshToken: string) => {
    await apiClient.post('/auth/logout/', { refresh: refreshToken })
  },

  getProfile: async () => {
    const { data } = await apiClient.get<User>('/auth/profile/')
    return data
  },

  updateProfile: async (profileData: Partial<User>) => {
    const { data } = await apiClient.patch<User>('/auth/profile/', profileData)
    return data
  },
}
