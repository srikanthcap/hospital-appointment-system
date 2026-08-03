import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Mail, Lock, LogIn, AlertCircle, HeartPulse, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const { login, isAuthenticated, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-[calc(100vh-76px)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
      
      {/* LEFT PANEL: HERO BANNER & STATS */}
      <div className="hidden lg:flex lg:col-span-5 bg-slate-950/40 relative flex-col justify-between p-12 border-r border-slate-900 overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Branding header */}
        <div className="flex items-center space-x-2 text-white font-extrabold text-2xl tracking-tight z-10 animate-fade-in-up">
          <HeartPulse className="h-8 w-8 text-primary-500 animate-pulse-glow" />
          <span>CareFlow</span>
        </div>

        {/* Hero value prop */}
        <div className="my-auto space-y-8 z-10 max-w-md">
          <div className="animate-fade-in-up animate-delay-100">
            <span className="inline-flex items-center space-x-1.5 bg-primary-500/10 text-primary-400 border border-primary-500/20 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="h-3 w-3" />
              <span>Digital Health Hub</span>
            </span>
            <h2 className="text-3xl font-extrabold text-white leading-snug">
              Simplifying healthcare access for patients and doctors.
            </h2>
          </div>

          <div className="space-y-4 animate-fade-in-up animate-delay-200">
            <div className="flex items-start space-x-3.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-400 leading-relaxed">
                <strong className="text-slate-200 font-semibold">Immediate Appointments:</strong> Browse calendars, select availability, and book instantly.
              </p>
            </div>
            <div className="flex items-start space-x-3.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-400 leading-relaxed">
                <strong className="text-slate-200 font-semibold">Consolidated Records:</strong> Doctors compile digital prescription sheets directly linked to clinical histories.
              </p>
            </div>
            <div className="flex items-start space-x-3.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-400 leading-relaxed">
                <strong className="text-slate-200 font-semibold">Supervision Controls:</strong> Administrators monitor scheduling pipelines, clinics, and profiles.
              </p>
            </div>
          </div>
        </div>

        {/* Stats footer */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-8 z-10 animate-fade-in-up animate-delay-300">
          <div>
            <p className="text-2xl font-extrabold text-white">99.8%</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wider">Booking Success</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-white">15 Sec</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wider">Average Scheduling Time</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: LOGIN FORM CARD */}
      <div className="lg:col-span-7 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-primary-500/5 rounded-full blur-[90px] pointer-events-none -z-10" />

        <div className="glass-panel w-full max-w-md p-8 sm:p-10 rounded-3xl border border-slate-800/80 shadow-2xl animate-fade-in-up">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Sign In</h2>
            <p className="mt-2 text-sm text-slate-400">Welcome back. Enter credentials to log in.</p>
          </div>

          {/* Form error display */}
          {(localError || error) && (
            <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-2xl p-4 flex items-start space-x-3 text-sm mb-6 animate-pulse-glow">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error:</span> {localError || error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-600">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  placeholder="you@careflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="custom-input pl-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-600">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="custom-input pl-12"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl py-3.5 transition-all duration-200 shadow-md shadow-primary-950/20 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying credentials...</span>
                </span>
              ) : (
                <>
                  <LogIn className="h-4.5 w-4.5" />
                  <span>Access Platform</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-sm text-slate-400">
              New to CareFlow?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
