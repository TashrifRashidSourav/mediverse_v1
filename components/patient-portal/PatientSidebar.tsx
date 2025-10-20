import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { MedicalIcon } from '../icons/MedicalIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { BillingIcon } from '../icons/BillingIcon';
import { ReportsIcon } from '../icons/ReportsIcon'; // Re-using for prescriptions
import { XIcon } from '../icons/XIcon';
import { LayoutDashboardIcon } from '../icons/LayoutDashboardIcon';
import { StethoscopeIcon } from '../icons/StethoscopeIcon';
import { BuildingOfficeIcon } from '../icons/BuildingOfficeIcon';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  patientName: string;
}

const navItems = [
  { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboardIcon, end: true },
  { name: 'My Profile', path: '/patient/dashboard/profile', icon: UserCircleIcon },
  { name: 'Find a Doctor', path: '/patient/dashboard/doctors', icon: StethoscopeIcon },
  { name: 'Hospitals', path: '/patient/dashboard/hospitals', icon: BuildingOfficeIcon },
  { name: 'Appointments', path: '/patient/dashboard/appointments', icon: CalendarIcon },
  { name: 'Prescriptions', path: '/patient/dashboard/prescriptions', icon: ReportsIcon },
  { name: 'Billing', path: '/patient/dashboard/billing', icon: BillingIcon },
];

const PatientSidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, patientName }) => {

  const navLinkClasses = 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors';
  const activeLinkClasses = 'bg-primary text-white';
  
  const handleLinkClick = () => {
      if (window.innerWidth < 768) {
          setIsOpen(false);
      }
  };

  return (
    <>
      <aside className={`fixed top-0 left-0 z-50 w-64 h-screen bg-slate-800 text-white flex flex-col transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <Link to="/patient/dashboard" className="flex items-center gap-2">
            <MedicalIcon className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold truncate">Patient Portal</span>
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
                  to={item.path}
                  end={item.end}
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

export default PatientSidebar;