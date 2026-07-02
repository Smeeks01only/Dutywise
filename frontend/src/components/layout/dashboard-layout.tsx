import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./sidebar"
import { Drawer } from "../ui/drawer"
import { GlobalSearchBar } from "./GlobalSearchBar"

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
        {/* Unified Header */}
        <header className="flex h-16 items-center justify-between border-b border-blue-100 bg-surface px-4 md:px-8">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted text-text-secondary mr-4 md:hidden"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
              <span className="sr-only">Toggle Sidebar</span>
            </button>
            <span className="font-bold text-lg md:hidden">DutyWise ZW</span>
          </div>
          
          <div className="flex-1 flex justify-end">
            <GlobalSearchBar />
          </div>
        </header>
        
        <main className="flex-1 bg-background p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
