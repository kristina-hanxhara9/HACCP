import { Outlet } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Menu } from 'lucide-react';

export function AppLayout() {
  const { isMobile, setSidebarOpen } = useAppStore();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar />

      {/* Mobile header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#e2e8f0] flex items-center px-4 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-[#64748b]">
            <Menu size={22} />
          </button>
          <span className="ml-3 text-sm font-bold text-[#0f172a]">SiguriUshqimore HACCP</span>
        </header>
      )}

      {/* Main content */}
      <main
        className={`transition-all duration-200 ${
          isMobile ? 'pt-14 pb-16 px-4' : 'ml-60 p-8'
        }`}
      >
        <div className="max-w-[1200px] mx-auto">
          <Outlet />
        </div>
      </main>

      {isMobile && <MobileNav />}
    </div>
  );
}
