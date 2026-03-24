import { NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Settings,
  LogOut,
  X,
  Shield,
} from 'lucide-react';

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Pasqyra' },
  { to: '/app/businesses', icon: Building2, label: 'Bizneset' },
  { to: '/app/inspections', icon: ClipboardCheck, label: 'Inspektimet' },
  { to: '/app/nonconformances', icon: AlertTriangle, label: 'Mospërputhjet' },
  { to: '/app/reports', icon: FileText, label: 'Raportet' },
  { to: '/app/settings', icon: Settings, label: 'Cilësimet' },
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, isMobile, logout } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isMobile && !sidebarOpen) return null;

  return (
    <>
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-white border-r border-[#e2e8f0] flex flex-col z-50 transition-transform duration-200 ${
          isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#e2e8f0]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#1a5c35] flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0f172a] leading-tight">SiguriUshqimore</p>
                <p className="text-[10px] font-medium text-[#64748b] tracking-wider uppercase">HACCP Platform</p>
              </div>
            </div>
            {isMobile && (
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-[#64748b]">
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#f0f9f1] text-[#1a5c35]'
                    : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                }`
              }
              end={item.to === '/app'}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#64748b] hover:bg-[#fef2f2] hover:text-[#dc2626] transition-colors w-full"
          >
            <LogOut size={20} />
            Dil
          </button>
        </div>
      </aside>
    </>
  );
}
