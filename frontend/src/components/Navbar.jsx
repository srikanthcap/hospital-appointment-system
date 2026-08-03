import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Activity, LogOut, Calendar, ShieldAlert, HeartPulse, User } from 'lucide-react';

export const Navbar = () => {
  const { isAuthenticated, role, fullName, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2 text-white font-extrabold text-2xl tracking-tight">
          <HeartPulse className="h-8 w-8 text-primary-500 animate-pulse-subtle" />
          <span className="bg-gradient-to-r from-white via-slate-100 to-primary-400 bg-clip-text text-transparent">
            CareFlow
          </span>
        </Link>

        {/* Navigation Links / Status */}
        <div className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              {/* Role Indicator badge */}
              <div className="hidden sm:flex items-center space-x-2 bg-slate-900/60 border border-slate-800 rounded-full px-4 py-1.5 text-xs text-slate-300">
                {role === 'admin' && <ShieldAlert className="h-3.5 w-3.5 text-red-400" />}
                {role === 'doctor' && <Activity className="h-3.5 w-3.5 text-emerald-400" />}
                {role === 'patient' && <User className="h-3.5 w-3.5 text-primary-400" />}
                <span className="capitalize font-semibold tracking-wide text-slate-200">{role} Mode</span>
              </div>

              {/* Greeting */}
              <span className="text-slate-300 text-sm hidden md:inline font-medium">
                Welcome, <span className="text-white font-semibold">{fullName}</span>
              </span>

              {/* Action Buttons */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 shadow-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white text-sm font-semibold transition-colors duration-150"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 shadow-md shadow-primary-950/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
