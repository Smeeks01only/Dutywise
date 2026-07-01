import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../api/auth'
import type { User, LoginCredentials, RegisterCredentials } from '../api/auth'
import { jwtDecode } from 'jwt-decode'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (profileData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const decoded = jwtDecode(token)
          // Check if token is expired
          if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            throw new Error("Token expired")
          }
          // Fetch fresh user profile
          const userData = await authApi.getProfile()
          setUser(userData)
        } catch (error) {
          console.error("Auth init failed", error)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const data = await authApi.login(credentials)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
  }

  const register = async (credentials: RegisterCredentials) => {
    const data = await authApi.register(credentials)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } catch (error) {
      console.error("Logout error", error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
      window.location.href = '/login'
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    const updatedUser = await authApi.updateProfile(profileData)
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
