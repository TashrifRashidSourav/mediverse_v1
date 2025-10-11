import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { MedicalIcon } from '../icons/MedicalIcon';
import { LayoutDashboardIcon } from '../icons/LayoutDashboardIcon';
import { StethoscopeIcon } from '../icons/StethoscopeIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { BillingIcon } from '../icons/BillingIcon';
import { InventoryIcon } from '../icons/InventoryIcon';
import { ReportsIcon } from '../icons/ReportsIcon';
import { GlobeIcon } from '../icons/GlobeIcon';
import { XIcon } from '../icons/XIcon';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  hospitalName: string;
  subdomain: string;
}

const navItems = [
  { name: 'Dashboard', path: '', icon: LayoutDashboardIcon },
  { name: 'Doctors', path: 'doctors', icon: StethoscopeIcon },
  { name: 'Patients', path: 'patients', icon: UsersIcon },
  { name: 'Appointments', path: 'appointments', icon: CalendarIcon },
  { name: 'Website', path: 'settings', icon: GlobeIcon },
  { name: 'Billing', path: 'billing', icon: BillingIcon },
  { name: 'Inventory', path: 'inventory', icon: InventoryIcon },
  { name: 'Reports', path: 'reports', icon: ReportsIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, hospitalName, subdomain }) => {
  const baseDashboardPath = `/${subdomain}/dashboard`;

  const navLinkClasses = 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors';
  const activeLinkClasses = 'bg-primary text-white';
  
  const handleLinkClick = () => {
      if (window.innerWidth < 768) { // Only close on mobile
          setIsOpen(false);
      }
  };

  return (
    <>
      <aside className={`fixed top-0 left-0 z-50 w-64 h-screen bg-slate-800 text-white flex flex-col transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <Link to={baseDashboardPath} className="flex items-center gap-2">
            <MedicalIcon className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold truncate">{hospitalName}</span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4 flex-grow overflow-y-auto">
          <ul>
            {navItems.map(item => (
              <li key={item.name} className="mb-1">
                <NavLink
                  to={`${baseDashboardPath}/${item.path}`}
                  end={item.path === ''}
                  onClick={handleLinkClick}
                  className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;