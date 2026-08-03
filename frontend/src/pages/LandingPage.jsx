import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Calendar, FileText, BarChart, Shield, ArrowRight, HeartPulse, Sparkles } from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: <Calendar className="h-6 w-6 text-primary-400" />,
      title: "Real-time Booking",
      desc: "Browse doctors and immediately book open slots with instant confirmation and conflict checks."
    },
    {
      icon: <FileText className="h-6 w-6 text-emerald-400" />,
      title: "Prescription Archives",
      desc: "Access your complete diagnosis, prescription history, and doctor notes securely from one centralized place."
    },
    {
      icon: <BarChart className="h-6 w-6 text-indigo-400" />,
      title: "Schedule Management",
      desc: "Doctors can set their availability slots, track upcoming appointments, and add prescription history effortlessly."
    },
    {
      icon: <Shield className="h-6 w-6 text-rose-400" />,
      title: "Administrative Control",
      desc: "Supervise overall operations, manage doctor-patient data, and analyze system-wide hospital schedules."
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-76px)] flex flex-col justify-between py-12 px-6 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex-grow flex flex-col items-center justify-center text-center my-8 md:my-16">
        {/* Promotion tag */}
        <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-8 animate-pulse-subtle">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next Generation Patient Care</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
          Streamlining Hospital Appointments &amp;{' '}
          <span className="bg-gradient-to-r from-primary-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
            Care Operations
          </span>
        </h1>

        {/* Hero Paragraph */}
        <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed">
          CareFlow bridges the gap between doctors, patients, and administrators, providing a seamless workflow for bookings, medical records, and schedule tracking.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <Link
            to="/register"
            className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl px-8 py-4 transition-all duration-200 shadow-lg shadow-primary-950/20 group"
          >
            <span>Register Now</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-semibold rounded-2xl px-8 py-4 transition-all duration-200"
          >
            Sign In to Account
          </Link>
        </div>

        {/* Features Grid */}
        <div className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
          {features.map((f, i) => (
            <div key={i} className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 w-fit mb-5">
                  {f.icon}
                </div>
                <h3 className="text-white font-bold text-lg">{f.title}</h3>
                <p className="mt-2.5 text-sm text-slate-400 leading-relaxed font-normal">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 border-t border-slate-800/50 pt-8 max-w-7xl mx-auto w-full">
        &copy; {new Date().getFullYear()} CareFlow Healthcare Systems. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
