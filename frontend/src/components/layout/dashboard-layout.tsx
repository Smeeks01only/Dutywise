import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./sidebar"
import { TopNav } from "./top-nav"
import { Drawer } from "../ui/drawer"

export function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar className="fixed inset-y-0 left-0 z-50" />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        position="left"
        className="p-0 border-none w-64"
      >
        <Sidebar className="w-full border-none h-full" />
      </Drawer>

      <div className="flex flex-1 flex-col md:pl-64">
        <TopNav toggleSidebar={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 bg-background p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
