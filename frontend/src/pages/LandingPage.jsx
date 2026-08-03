import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Calendar, FileText, BarChart, Shield, ArrowRight, HeartPulse, Sparkles, UserCircle2 } from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: <Calendar className="h-6 w-6 text-[#590ce8]" />,
      title: "Real-time Booking",
      desc: "Browse doctors and immediately book open slots with instant confirmation and conflict checks."
    },
    {
      icon: <FileText className="h-6 w-6 text-[#590ce8]" />,
      title: "Prescription Archives",
      desc: "Access your complete diagnosis, prescription history, and doctor notes securely from one centralized place."
    },
    {
      icon: <BarChart className="h-6 w-6 text-[#590ce8]" />,
      title: "Schedule Management",
      desc: "Doctors can set their availability slots, track upcoming appointments, and add prescription history effortlessly."
    },
    {
      icon: <Shield className="h-6 w-6 text-[#590ce8]" />,
      title: "Administrative Control",
      desc: "Supervise overall operations, manage doctor-patient data, and analyze system-wide hospital schedules."
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-76px)] flex flex-col justify-between py-12 px-6 overflow-hidden bg-gradient-to-r from-[#590ce8] via-[#354eff] to-[#00bfff] text-white">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex-grow flex flex-col items-center justify-center text-center my-8 md:my-16">
        
        {/* Promotion tag */}
        <div className="inline-flex items-center space-x-2 bg-white/15 border border-white/20 text-white rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-8 animate-pulse-glow">
          <Sparkles className="h-3.5 w-3.5" />
          <span>CareFlow Operations Node</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl uppercase">
          Global Hospitals <br />
          <span className="text-[#f5f3ff] drop-shadow-md">
            Consultation Hub
          </span>
        </h1>

        {/* Hero Paragraph */}
        <p className="mt-6 text-base md:text-lg text-slate-100/90 max-w-2xl font-normal leading-relaxed">
          Bridging the gap between doctors, patients, and administrators. Seamlessly schedule appointments, coordinate medical records, and track clinic slots.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <Link
            to="/register"
            className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-white hover:bg-slate-50 text-[#590ce8] font-bold rounded-2xl px-8 py-4 transition-all duration-200 shadow-lg group text-sm tracking-wider uppercase"
          >
            <span>Register Now</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center w-full sm:w-auto bg-transparent hover:bg-white/10 text-white border border-white/40 font-bold rounded-2xl px-8 py-4 transition-all duration-200 text-sm tracking-wider uppercase"
          >
            Sign In
          </Link>
        </div>

        {/* Features Grid */}
        <div className="mt-20 md:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 flex flex-col justify-between text-slate-800 shadow-xl border border-white/10 hover:-translate-y-2 transition-all duration-350">
              <div>
                <div className="bg-[#f0ebff] border border-indigo-100 rounded-2xl p-3 w-fit mb-5">
                  {f.icon}
                </div>
                <h3 className="text-slate-900 font-extrabold text-lg">{f.title}</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed font-semibold">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[10px] text-slate-100/60 border-t border-white/20 pt-8 max-w-7xl mx-auto w-full">
        &copy; {new Date().getFullYear()} Global Hospitals Group. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
