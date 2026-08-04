import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onOpenSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
