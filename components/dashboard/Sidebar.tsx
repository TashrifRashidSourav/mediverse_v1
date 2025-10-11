import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { MedicalIcon } from '../icons/MedicalIcon';
import { LayoutDashboardIcon } from '../icons/LayoutDashboardIcon';
import { StethoscopeIcon } from '../icons/StethoscopeIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { BillingIcon } from '../icons/BillingIcon';
import { InventoryIcon } from '../icons/InventoryIcon';
import { ReportsIcon } from '../icons/ReportsIcon';

interface SidebarProps {
  hospitalName: string;
  subdomain: string;
}

const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const baseClasses = "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200";
  const inactiveClasses = "text-slate-300 hover:bg-primary-800 hover:text-white";
  const activeClasses = "bg-primary-700 text-white font-semibold shadow-inner";

  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ hospitalName, subdomain }) => {
  const dashboardBaseUrl = `/${subdomain}/dashboard`;
  const navItems = [
    { to: dashboardBaseUrl, icon: <LayoutDashboardIcon className="h-5 w-5" />, label: 'Dashboard' },
    { to: `${dashboardBaseUrl}/doctors`, icon: <StethoscopeIcon className="h-5 w-5" />, label: 'Doctors' },
    { to: `${dashboardBaseUrl}/patients`, icon: <UsersIcon className="h-5 w-5" />, label: 'Patients' },
    { to: `${dashboardBaseUrl}/appointments`, icon: <CalendarIcon className="h-5 w-5" />, label: 'Appointments' },
    { to: `${dashboardBaseUrl}/billing`, icon: <BillingIcon className="h-5 w-5" />, label: 'Billing' },
    { to: `${dashboardBaseUrl}/inventory`, icon: <InventoryIcon className="h-5 w-5" />, label: 'Inventory' },
    { to: `${dashboardBaseUrl}/reports`, icon: <ReportsIcon className="h-5 w-5" />, label: 'Reports' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
      <div className="h-16 flex items-center justify-center px-4 border-b border-slate-800">
         <div className="flex items-center gap-2">
            <MedicalIcon className="h-7 w-7 text-primary-400" />
            <span className="text-xl font-bold truncate">{hospitalName}</span>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(item => (
            <NavItem key={item.label} to={item.to} icon={item.icon} label={item.label} />
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Mediverse</p>
      </div>
    </aside>
  );
};

export default Sidebar;