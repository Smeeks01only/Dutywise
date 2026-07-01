import { Outlet, Link } from "react-router-dom"
import { Scale, ArrowLeft } from "lucide-react"

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
      <Link 
        to="/" 
        className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Link>
      
      {/* Optional: Add the logo above the card */}
      <div className="flex flex-col items-center space-y-4 mb-8">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900">DutyWise ZW</span>
        </Link>
      </div>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
