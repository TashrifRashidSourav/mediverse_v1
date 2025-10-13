import React from 'react';
import { MedicalIcon } from './icons/MedicalIcon';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-slate-900 text-slate-400">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <MedicalIcon className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-white">Mediverse</span>
            </div>
            <p className="max-w-md">Supporting hospitals with simple digital tools to better care and connect with patients.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white tracking-wider uppercase">Product</h4>
            <ul className="mt-4 space-y-2">
              <li><a href="/#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="/#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Updates</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white tracking-wider uppercase">Company</h4>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Mediverse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;