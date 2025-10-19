import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MedicalIcon } from '../../components/icons/MedicalIcon';

const SuperAdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Hardcoded credentials as per the request
    if (email === 'super@gmail.com' && password === '12345678') {
      localStorage.setItem('isSuperAdmin', 'true');
      navigate('/super-admin/dashboard');
    } else {
      setError('Invalid credentials.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <MedicalIcon className="h-12 w-12 text-primary mx-auto" />
            <h2 className="mt-4 text-3xl font-bold text-white">Super Admin Portal</h2>
            <p className="mt-2 text-slate-400">Mediverse Platform Management</p>
          </div>
          <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="font-semibold text-slate-300 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="font-semibold text-slate-300 block mb-1.5">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition text-white"
                  required
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? 'Logging In...' : 'Log In'}
              </button>
            </form>
          </div>
        </div>
    </div>
  );
};

export default SuperAdminLoginPage;
