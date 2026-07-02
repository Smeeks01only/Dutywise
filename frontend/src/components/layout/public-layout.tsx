import { Outlet } from "react-router-dom"
import { TopNav, Footer } from "./top-nav"
import { useAuth } from "../../context/AuthContext"
import { DashboardLayout } from "./dashboard-layout"

export function PublicLayout() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <DashboardLayout />
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="flex-1 bg-background">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
