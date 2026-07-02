import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileCode2, 
  Calculator, 
  LogOut,
  Menu,
  BookOpen,
  ShieldAlert,
  Building2,
  Handshake
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'HS Codes', path: '/admin/hscodes', icon: FileCode2 },
    { name: 'Tariffs & Taxes', path: '/admin/tariffs', icon: Calculator },
    { name: 'Glossary', path: '/admin/glossary', icon: BookOpen },
    { name: 'Restrictions', path: '/admin/restrictions', icon: ShieldAlert },
    { name: 'Agencies', path: '/admin/agencies', icon: Building2 },
    { name: 'Agreements', path: '/admin/agreements', icon: Handshake },
  ];

  return (
    <div className="flex h-screen bg-slate-50 ">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 ">
          <Link to="/admin" className="font-bold text-xl text-primary flex items-center gap-2">
            DutyWise <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full uppercase tracking-wider font-semibold">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'text-slate-600 hover:bg-slate-100 :bg-slate-800 hover:text-slate-900 :text-slate-100'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-200 ">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.first_name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              logout('/login');
            }}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 w-full px-2 py-1.5 rounded hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:hidden">
            <button className="p-2 mr-3 text-slate-500">
                <Menu size={24} />
            </button>
            <span className="font-bold text-lg">DutyWise Admin</span>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
