import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

interface TopBarProps {
  onOpenSidebar: () => void;
}

export function TopBar({ onOpenSidebar }: TopBarProps) {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Calculator';
      case '/history':
        return 'History';
      case '/login':
        return 'Login';
      case '/register':
        return 'Register';
      default:
        return 'DutyWise';
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-neutral-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-neutral-700 md:hidden hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
        onClick={onOpenSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator for mobile */}
      <div className="h-6 w-px bg-neutral-200 md:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <h1 className="text-xl font-bold leading-6 text-neutral-900">{getPageTitle()}</h1>
        </div>
      </div>
    </header>
  );
}
