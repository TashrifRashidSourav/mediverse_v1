import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MedicalIcon } from '../components/icons/MedicalIcon';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (user) {
      // Create a session for the user
      localStorage.setItem('userSession', JSON.stringify(user));
      window.dispatchEvent(new Event('storage')); // Notify header to update
      navigate('/dashboard');
    } else {
      setError('Invalid email or password.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <MedicalIcon className="h-12 w-12 text-primary mx-auto" />
            <h2 className="mt-4 text-3xl font-bold text-slate-900">Welcome Back</h2>
            <p className="mt-2 text-slate-600">Log in to manage your hospital's website.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="font-semibold text-slate-700 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="font-semibold text-slate-700 block mb-1.5">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition"
                  required
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? 'Logging In...' : 'Log In'}
              </button>
            </form>
            <p className="text-center text-slate-600 mt-6 text-sm">
                Don't have an account?{' '}
                <Link to="/#pricing" className="font-semibold text-primary hover:underline">
                    Sign up
                </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;