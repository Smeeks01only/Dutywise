import { Link, useLocation } from "react-router-dom"
import { Calculator, FileText, Globe, Scale, LayoutDashboard, FolderHeart, Settings, User, LogOut } from "lucide-react"
import { cn } from "../../lib/utils"
import { useAuth } from "../../context/AuthContext"

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Saved Calculations", href: "/dashboard/saved", icon: FolderHeart },
]

const toolsNav = [
  { name: "Duty Calculator", href: "/calculator", icon: Calculator },
  { name: "Tariff Explorer", href: "/tariffs", icon: Globe },
  { name: "Import Rules", href: "/rules", icon: Scale },
]

const settingsNav = [
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation()
  const { user, logout } = useAuth()

  const renderNavItems = (items: any[]) => {
    return items.map((item) => {
      const isActive = location.pathname === item.href
      return (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-foreground",
            isActive ? "bg-muted text-foreground" : "text-text-secondary"
          )}
        >
          <item.icon className={cn("mr-2 h-4 w-4", isActive ? "text-foreground" : "text-text-secondary")} />
          <span>{item.name}</span>
        </Link>
      )
    })
  }

  return (
    <nav className={cn("flex flex-col h-full bg-surface border-r border-blue-100 p-4 w-64", className)}>
      <div className="flex items-center space-x-2 mb-8 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <Scale className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-lg">DutyWise ZW</span>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto">
        <div>
          <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">Overview</h4>
          <div className="space-y-1">{renderNavItems(mainNav)}</div>
        </div>
        
        <div>
          <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">Customs Tools</h4>
          <div className="space-y-1">{renderNavItems(toolsNav)}</div>
        </div>

        <div>
          <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">Account</h4>
          <div className="space-y-1">{renderNavItems(settingsNav)}</div>
        </div>
      </div>

      <div className="p-4 border-t border-blue-100 mt-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {user?.first_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-foreground truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-text-secondary truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={() => logout('/login')}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 w-full px-2 py-1.5 rounded hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </nav>
  )
}
