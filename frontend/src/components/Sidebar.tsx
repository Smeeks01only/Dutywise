import { NavLink, Link } from 'react-router-dom';
import { Calculator, History, Lock, X, LogOut, LogIn, UserPlus, Globe2, UserCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isAuthenticated, user, logout } = useAuth();

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-x-3 rounded-xl p-2.5 text-sm font-semibold leading-6 transition-all duration-200 ${
      isActive
        ? 'bg-primary-50 text-primary-600' // Reference design blue active state
        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-neutral-900/80 backdrop-blur-sm transition-opacity md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-neutral-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Globe2 className="h-6 w-6 text-primary-600" />
            <span className="text-xl font-bold tracking-tight text-neutral-900">DutyWise</span>
          </div>
          <button 
            type="button" 
            className="md:hidden -m-2.5 p-2.5 text-neutral-500 hover:text-neutral-900"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <nav className="flex flex-1 flex-col p-4">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                <li>
                  <NavLink to="/" className={navLinkClasses} onClick={onClose}>
                    <Calculator className="h-5 w-5 shrink-0" aria-hidden="true" />
                    Calculator
                  </NavLink>
                </li>
                <li>
                  {isAuthenticated ? (
                    <NavLink to="/profile" className={navLinkClasses} onClick={onClose}>
                      <UserCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                      Profile
                    </NavLink>
                  ) : (
                    <div className="group flex items-center gap-x-3 rounded-xl p-2.5 text-sm font-semibold leading-6 text-neutral-400 cursor-not-allowed" title="Login required">
                      <UserCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                      Profile
                    </div>
                  )}
                </li>
                <li>
                  {isAuthenticated ? (
                    <NavLink to="/history" className={navLinkClasses} onClick={onClose}>
                      <History className="h-5 w-5 shrink-0" aria-hidden="true" />
                      History
                    </NavLink>
                  ) : (
                    <div className="group flex items-center gap-x-3 rounded-xl p-2.5 text-sm font-semibold leading-6 text-neutral-400 cursor-not-allowed" title="Login required">
                      <Lock className="h-5 w-5 shrink-0" aria-hidden="true" />
                      History
                    </div>
                  )}
                </li>
              </ul>
            </li>

            <li className="mt-auto -mx-2 pt-6">
              <hr className="border-neutral-200 mb-4" />
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="px-3 py-2 bg-neutral-50 rounded-xl">
                    <p className="text-xs font-medium text-neutral-500">Logged in as</p>
                    <p className="text-sm font-medium text-neutral-900 truncate" title={user?.email}>{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { logout(); onClose(); }}
                    className="w-full group flex items-center gap-x-3 rounded-xl p-2.5 text-sm font-semibold leading-6 text-neutral-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <LogOut className="h-5 w-5 shrink-0 group-hover:text-red-600" aria-hidden="true" />
                    Log out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="group flex items-center gap-x-3 rounded-xl p-2.5 text-sm font-semibold leading-6 text-neutral-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                  >
                    <LogIn className="h-5 w-5 shrink-0 group-hover:text-primary-600" aria-hidden="true" />
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={onClose}
                    className="group flex items-center gap-x-3 rounded-xl p-2.5 text-sm font-semibold leading-6 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                  >
                    <UserPlus className="h-5 w-5 shrink-0 group-hover:text-neutral-900" aria-hidden="true" />
                    Create account
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
