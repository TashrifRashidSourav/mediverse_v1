import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MedicalIcon } from '../components/icons/MedicalIcon';
import { auth, db } from '../firebase';
import { User } from '../types';

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

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user!;
      const userDocRef = db.collection('users').doc(user.uid);
      const userDoc = await userDocRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data() as User;

        if (userData.status === 'pending') {
          await auth.signOut();
          navigate('/pending-approval');
          return;
        }

        if (userData.status === 'rejected') {
          throw new Error("Your registration has been rejected. Please contact support.");
        }

        if (userData.status === 'approved' || !userData.status) { // Allow login if status is approved or not set (for older accounts)
          localStorage.setItem('userProfile', JSON.stringify({ 
            uid: user.uid, 
            subdomain: userData.subdomain, 
            hospitalName: userData.hospitalName,
            status: userData.status || 'approved' 
          }));
          navigate(`/${userData.subdomain}/dashboard`);
        } else {
          throw new Error("Invalid account status.");
        }

      } else {
        throw new Error("User profile not found.");
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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
