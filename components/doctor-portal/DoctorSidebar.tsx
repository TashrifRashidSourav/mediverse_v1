import React from 'react';
import { NavLink, Link, useParams } from 'react-router-dom';
import { MedicalIcon } from '../icons/MedicalIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { ClipboardIcon } from '../icons/ClipboardIcon';
import { XIcon } from '../icons/XIcon';
import { SiteSettings } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  hospitalName: string;
  settings: SiteSettings | null;
}

const DoctorSidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, hospitalName, settings }) => {
  const { subdomain } = useParams<{ subdomain: string }>();
  
  const baseDashboardPath = `/${subdomain}/doctor-portal/dashboard`;
  const themeColor = settings?.themeColor || '#0D9488';

  const navItems = [
    { name: 'My Schedule', path: '', icon: CalendarIcon, end: true },
    { name: 'Patient Access', path: 'patients', icon: UsersIcon },
  ];
  
  const navLinkClasses = 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors';
  
  const handleLinkClick = () => {
      if (window.innerWidth < 768) {
          setIsOpen(false);
      }
  };

  return (
    <>
      <aside className={`fixed top-0 left-0 z-50 w-64 h-screen bg-slate-800 text-white flex flex-col transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <Link to={baseDashboardPath} className="flex items-center gap-2">
            {settings?.logoUrl ? (
                <div className="h-8 w-8 flex items-center justify-center bg-white rounded-md p-1">
                    <img src={settings.logoUrl} alt={`${hospitalName} Logo`} className="h-full w-full object-contain" />
                </div>
            ) : (
                <MedicalIcon className="h-7 w-7" style={{color: themeColor}} />
            )}
            <span className="text-xl font-bold truncate">{hospitalName}</span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4 flex-grow overflow-y-auto">
           <p className="px-4 py-2 text-sm font-semibold text-slate-400">Doctor's Portal</p>
          <ul>
            {navItems.map(item => (
              <li key={item.name} className="mb-1">
                <NavLink
                  to={`${baseDashboardPath}/${item.path}`}
                  end={item.end}
                  onClick={handleLinkClick}
                  className={({ isActive }) => `${navLinkClasses} ${isActive ? 'text-white' : ''}`}
                  style={({ isActive }) => ({ backgroundColor: isActive ? themeColor : 'transparent' })}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
             <li className="mt-2 pt-2 border-t border-slate-700">
                 <Link to={`/${subdomain}/doctor-portal/dashboard/patients`} onClick={handleLinkClick} className={`${navLinkClasses} bg-slate-700/50`}>
                    <ClipboardIcon className="h-5 w-5"/>
                    <span>Write Prescription</span>
                 </Link>
             </li>
          </ul>
        </nav>
      </aside>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default DoctorSidebar;