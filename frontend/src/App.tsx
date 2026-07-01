import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/layout/protected-route"

import { PublicLayout } from "./components/layout/public-layout"
import { DashboardLayout } from "./components/layout/dashboard-layout"
import { AuthLayout } from "./components/layout/auth-layout"

import { HomePage } from "./pages/home"
import { CalculatorPage } from "./pages/calculator"
import { TariffExplorerPage } from "./pages/tariffs"
import { ImportRulesPage } from "./pages/rules"

import { DashboardPage } from "./pages/dashboard"
import { ProfilePage } from "./pages/profile"
import { SettingsPage } from "./pages/settings"

import { LoginPage } from "./pages/login"
import { RegisterPage } from "./pages/register"
import { ForgotPasswordPage } from "./pages/forgot-password"
import { ResetPasswordPage } from "./pages/reset-password"

import { NotFoundPage } from "./pages/not-found"
import { UIShowcasePage } from "./pages/ui-showcase"

import { SearchPage } from "./pages/search"
import { ProductDetailsPage } from "./pages/product-details"
import { HSCodeDetailsPage } from "./pages/hscode-details"
import { CategoryBrowserPage } from "./pages/category-browser"

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/tariffs" element={<TariffExplorerPage />} />
              <Route path="/rules" element={<ImportRulesPage />} />
              <Route path="/ui-showcase" element={<UIShowcasePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="/hs-code/:id" element={<HSCodeDetailsPage />} />
              <Route path="/categories" element={<CategoryBrowserPage />} />
            </Route>

            {/* Dashboard Routes - Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="saved" element={<div>Saved Calculations (Placeholder)</div>} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
