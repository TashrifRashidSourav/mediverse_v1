import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MedicalIcon } from './icons/MedicalIcon';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleNavAndScroll = (targetId: string) => {
    if (window.location.hash !== '#/') {
       navigate('/');
       setTimeout(() => {
         document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
       }, 100);
    } else {
       document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="bg-slate-900 text-slate-400">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <MedicalIcon className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-white">MediVerse</span>
            </div>
            <p className="max-w-md">Empowering hospitals with the digital tools they need to provide better care and connect with patients.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white tracking-wider uppercase">Product</h4>
            <ul className="mt-4 space-y-2">
              <li><button onClick={() => handleNavAndScroll('features')} className="hover:text-white transition-colors">Features</button></li>
              <li><button onClick={() => handleNavAndScroll('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white tracking-wider uppercase">Company</h4>
            <ul className="mt-4 space-y-2">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} MediVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;