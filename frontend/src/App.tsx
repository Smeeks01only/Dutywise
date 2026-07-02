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

import { AdminLayout } from "./components/layout/AdminLayout"
import { AdminRoute } from "./components/layout/AdminRoute"
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { AdminUsers } from "./pages/admin/AdminUsers"
import { AdminProducts } from "./pages/admin/AdminProducts"
import { AdminHSCodes } from "./pages/admin/AdminHSCodes"
import { AdminTariffs } from "./pages/admin/AdminTariffs"
import { AdminGlossary } from "./pages/admin/AdminGlossary"
import { AdminRestrictions } from "./pages/admin/AdminRestrictions"
import { AdminAgencies } from "./pages/admin/AdminAgencies"
import { AdminAgreements } from "./pages/admin/AdminAgreements"

import { HSChapterBrowser } from "./pages/explorer/HSChapterBrowser"
import { HSCodeExplorer } from "./pages/explorer/HSCodeExplorer"
import { DutyRateExplorer } from "./pages/explorer/DutyRateExplorer"
import { ImportRestrictions } from "./pages/explorer/ImportRestrictions"
import { GovernmentAgencies } from "./pages/explorer/GovernmentAgencies"
import { TradeAgreements } from "./pages/explorer/TradeAgreements"
import { CustomsGlossary } from "./pages/explorer/CustomsGlossary"
import { CompareHSCodes } from "./pages/explorer/CompareHSCodes"
import { BookmarksPanel } from "./pages/explorer/BookmarksPanel"

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

              {/* Explorer Sub-Routes */}
              <Route path="/explorer/chapters" element={<HSChapterBrowser />} />
              <Route path="/explorer/hscodes" element={<HSCodeExplorer />} />
              <Route path="/explorer/tariffs" element={<DutyRateExplorer />} />
              <Route path="/explorer/restrictions" element={<ImportRestrictions />} />
              <Route path="/explorer/agencies" element={<GovernmentAgencies />} />
              <Route path="/explorer/agreements" element={<TradeAgreements />} />
              <Route path="/explorer/glossary" element={<CustomsGlossary />} />
              <Route path="/explorer/compare" element={<CompareHSCodes />} />
              <Route path="/explorer/bookmarks" element={<BookmarksPanel />} />
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

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="hscodes" element={<AdminHSCodes />} />
                <Route path="tariffs" element={<AdminTariffs />} />
                <Route path="glossary" element={<AdminGlossary />} />
                <Route path="restrictions" element={<AdminRestrictions />} />
                <Route path="agencies" element={<AdminAgencies />} />
                <Route path="agreements" element={<AdminAgreements />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
