import { Outlet } from "react-router-dom"
import { TopNav, Footer } from "./top-nav"

export function PublicLayout() {
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
