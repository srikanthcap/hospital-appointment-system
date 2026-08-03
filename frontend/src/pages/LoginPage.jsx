import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Mail, Lock, AlertCircle, Building2, UserCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const { login, isAuthenticated, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient'); // 'patient', 'doctor', 'admin'
  const [localError, setLocalError] = useState(null);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#590ce8] via-[#354eff] to-[#00bfff] flex flex-col justify-between p-6 relative font-sans text-white overflow-y-auto">
      
      {/* HEADER NAVIGATION */}
      <header className="flex justify-between items-center max-w-7xl w-full mx-auto z-10 px-4 mt-2">
        {/* Branding top-left */}
        <div className="flex items-center space-x-2 text-white font-extrabold text-lg tracking-wide select-none">
          <UserCircle2 className="h-6 w-6 text-white" />
          <span>GLOBAL HOSPITALS</span>
        </div>
        
        {/* Nav Links */}
        <nav className="flex space-x-8 text-xs font-bold tracking-wider text-slate-100/90 uppercase">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <a href="#" className="hover:text-white transition-colors">About Us</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </nav>
      </header>

      {/* DUAL-PANEL BODY */}
      <main className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 my-auto px-4 z-10 py-8">
        
        {/* LEFT COLUMN: BRANDING HERO */}
        <div className="flex flex-col items-center justify-center text-center space-y-6 md:pr-8">
          {/* Custom White Ambulance Icon */}
          <div className="relative">
            <svg
              className="h-28 w-28 text-white filter drop-shadow-lg"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19 10.5V13h-2v-2.5h2zM3 13V7h10v6H3zm13.5-3.5h2.79c.4 0 .76.24.91.6l1.3 3.12c.1.25.1.53 0 .78l-.68 1.63c-.15.37-.51.62-.91.62h-.4c-.26 1.4-1.49 2.5-2.98 2.5s-2.72-1.1-2.98-2.5H9.46c-.26 1.4-1.49 2.5-2.98 2.5s-2.72-1.1-2.98-2.5H3v-1.5c0-.83.67-1.5 1.5-1.5h1.5v-1h3v1h3v-1h1.5c.83 0 1.5.67 1.5 1.5v1.5h1.5V9.5zM6.5 17c.83 0 1.5-.67 1.5-1.5S7.33 14 6.5 14s-1.5.67-1.5 1.5S5.67 17 6.5 17zm10 0c.83 0 1.5-.67 1.5-1.5S17.33 14 17.3 14s-1.5.67-1.5 1.5.67 1.5 1.5 1.5z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-extrabold tracking-wide uppercase">We are here for you!</h2>
        </div>

        {/* RIGHT COLUMN: LOGIN FORM CARD */}
        <div className="flex justify-center">
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl text-slate-800 w-full max-w-md border border-white/20 relative">
            
            {/* Card Top Icon (Hospital Logo) */}
            <div className="flex flex-col items-center mb-6">
              <div className="bg-[#f0ebff] p-4 rounded-2xl border border-indigo-100 text-[#590ce8] mb-3">
                <Building2 className="h-10 w-10" />
              </div>
              
              {/* Dynamic Title based on Active Role */}
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight capitalize">
                {role} Login
              </h3>
            </div>

            {/* Role selection tabs inside form */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {['patient', 'doctor', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setLocalError(null); }}
                  className={`py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all duration-150 ${
                    role === r
                      ? 'bg-[#590ce8]/10 border-[#590ce8] text-[#590ce8]'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Errors */}
            {(localError || error) && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-3.5 flex items-start space-x-2 text-xs mb-5 font-semibold">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{localError || error}</span>
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-12 items-center gap-2">
                <label className="col-span-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email-ID:</label>
                <div className="col-span-8 relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f0f2ff]/60 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#590ce8]/30 focus:border-[#590ce8] transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 items-center gap-2">
                <label className="col-span-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Password:</label>
                <div className="col-span-8 relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f0f2ff]/60 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#590ce8]/30 focus:border-[#590ce8] transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-1/2 bg-[#590ce8] hover:bg-[#4809c2] text-white font-bold rounded-xl py-2.5 transition-all shadow-md shadow-[#590ce8]/20 text-sm tracking-wider uppercase"
                >
                  {loading ? 'Logging In...' : 'Login'}
                </button>
              </div>

            </form>

            {/* Link to signup */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-semibold">
                New Patient?{' '}
                <Link to="/register" className="text-[#590ce8] hover:text-[#4809c2] font-bold transition-colors">
                  Create Profile
                </Link>
              </p>
            </div>

          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="text-center text-[10px] text-slate-100/70 z-10 pt-4">
        &copy; {new Date().getFullYear()} Global Hospitals Group. All rights reserved.
      </footer>

    </div>
  );
};

export default LoginPage;
