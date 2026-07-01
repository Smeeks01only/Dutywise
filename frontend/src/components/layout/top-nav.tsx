import { Link, useLocation } from "react-router-dom"
import { Calculator, FileText, Globe, Home, Scale, User, Settings, Menu, LogOut } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { useAuth } from "../../context/AuthContext"
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu"
import { Avatar } from "../ui/avatar"
import { GlobalSearchBar } from "./GlobalSearchBar"

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Calculator", href: "/calculator", icon: Calculator },
  { name: "Tariff Explorer", href: "/tariffs", icon: Globe },
  { name: "Import Rules", href: "/rules", icon: Scale },
]

export function TopNav({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F8FAFC]/90 backdrop-blur supports-[backdrop-filter]:bg-[#F8FAFC]/60 border-b border-slate-200">
      <div className="w-full flex h-16 items-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 mx-auto">
        {/* Left */}
        <div className="flex flex-1 items-center justify-start gap-4">
          {toggleSidebar && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <span className="hidden font-bold sm:inline-block">DutyWise ZW</span>
          </Link>
        </div>
          
        {/* Center */}
        <nav className="hidden md:flex items-center justify-center space-x-8 text-sm font-medium h-full">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative flex items-center h-full transition-colors hover:text-foreground/80",
                  isActive ? "text-primary" : "text-foreground/60"
                )}
              >
                {item.name}
                {isActive && (
                  <span className="absolute -bottom-[1px] left-0 w-full h-[3px] bg-primary rounded-t-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <GlobalSearchBar />
          
          {isAuthenticated && user ? (
            <DropdownMenu 
              align="right"
              trigger={
                <div className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm font-medium hidden sm:block">{user.first_name || user.email.split('@')[0]}</span>
                  <Avatar fallback={user.first_name || user.email} src={user.profile_picture || undefined} size="sm" />
                </div>
              }
            >
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{user.first_name} {user.last_name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <Link to="/dashboard">
                <DropdownMenuItem className="cursor-pointer">
                  <Home className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
              </Link>
              <Link to="/dashboard/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link to="/dashboard/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border py-6 md:py-0">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4">
        <p className="text-center text-sm leading-loose text-text-secondary md:text-left">
          Built for Zimbabwe. Not affiliated with ZIMRA.
        </p>
        <div className="flex items-center space-x-4 text-sm text-text-secondary">
          <Link to="/terms" className="hover:underline">Terms</Link>
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
        </div>
      </div>
    </footer>
  )
}
