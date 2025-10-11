import React from 'react';
import { InventoryIcon } from '../../components/icons/InventoryIcon';

const InventoryPage: React.FC = () => {
  return (
    <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Inventory Management</h1>
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <InventoryIcon className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Feature Coming Soon</h2>
            <p className="mt-2 text-slate-600 max-w-md mx-auto">
                We are building an inventory management system to help you track medicines and equipment stock efficiently. Stay tuned for updates!
            </p>
        </div>
    </div>
  );
};

export default InventoryPage;
