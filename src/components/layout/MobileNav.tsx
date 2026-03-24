import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  AlertTriangle,
  Settings,
} from 'lucide-react';

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Pasqyra' },
  { to: '/app/businesses', icon: Building2, label: 'Bizneset' },
  { to: '/app/inspections', icon: ClipboardCheck, label: 'Inspektimet' },
  { to: '/app/nonconformances', icon: AlertTriangle, label: 'NC' },
  { to: '/app/settings', icon: Settings, label: 'Cilësimet' },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e2e8f0] z-40 md:hidden">
      <div className="flex items-center justify-around py-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#1a5c35]' : 'text-[#94a3b8]'
              }`
            }
            end={item.to === '/app'}
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
