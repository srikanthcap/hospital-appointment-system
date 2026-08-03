import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { User, Mail, Lock, Phone, Calendar, MapPin, Award, Shield, UserPlus, AlertCircle, CheckCircle, UserCircle2 } from 'lucide-react';

export const RegisterPage = () => {
  const { register, isAuthenticated, loading, error } = useAuth();
  const navigate = useNavigate();

  // Basic info states
  const [role, setRole] = useState('patient'); // 'patient', 'doctor'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Patient profile states
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');

  // Doctor profile states
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');

  const [localError, setLocalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);

    if (!fullName || !email || !password) {
      setLocalError('Please fill in all basic fields.');
      return;
    }

    const payload = {
      full_name: fullName,
      email,
      password,
      role,
    };

    if (role === 'patient') {
      payload.phone = phone || null;
      payload.date_of_birth = dob || null;
      payload.address = address || null;
    } else if (role === 'doctor') {
      if (!specialization || !experience) {
        setLocalError('Specialization and experience are required for doctors.');
        return;
      }
      payload.specialization = specialization;
      payload.experience_years = parseInt(experience, 10);
    }

    const res = await register(payload);
    if (res.success) {
      setSuccessMsg('Registration completed successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#590ce8] via-[#354eff] to-[#00bfff] flex flex-col justify-between p-6 relative font-sans text-white overflow-y-auto">
      
      {/* HEADER NAVIGATION */}
      <header className="flex justify-between items-center max-w-7xl w-full mx-auto z-10 px-4 mt-2">
        <div className="flex items-center space-x-2 text-white font-extrabold text-lg tracking-wide select-none">
          <UserCircle2 className="h-6 w-6 text-white" />
          <span>GLOBAL HOSPITALS</span>
        </div>
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
          <h2 className="text-3xl font-extrabold tracking-wide uppercase">Join Global Hospitals</h2>
        </div>

        {/* RIGHT COLUMN: REGISTRATION CARD */}
        <div className="flex justify-center">
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl text-slate-800 w-full max-w-md border border-white/20 relative">
            
            <div className="flex flex-col items-center mb-6">
              <div className="bg-[#f0ebff] p-4 rounded-2xl border border-indigo-100 text-[#590ce8] mb-3">
                <UserPlus className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Create Account
              </h3>
            </div>

            {/* Role switch toggles */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => { setRole('patient'); setLocalError(null); }}
                className={`py-2 rounded-xl border text-[10px] font-bold uppercase transition-all duration-150 ${
                  role === 'patient'
                    ? 'bg-[#590ce8]/10 border-[#590ce8] text-[#590ce8]'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350'
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => { setRole('doctor'); setLocalError(null); }}
                className={`py-2 rounded-xl border text-[10px] font-bold uppercase transition-all duration-150 ${
                  role === 'doctor'
                    ? 'bg-[#590ce8]/10 border-[#590ce8] text-[#590ce8]'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350'
                }`}
              >
                Doctor
              </button>
            </div>

            {/* Alerts */}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl p-3.5 flex items-start space-x-2 text-xs mb-5 font-semibold">
                <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}
            {(localError || error) && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-3.5 flex items-start space-x-2 text-xs mb-5 font-semibold">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{localError || error}</span>
              </div>
            )}

            {/* Registration fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-12 items-center gap-2">
                <label className="col-span-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name:</label>
                <div className="col-span-8 relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#f0f2ff]/60 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#590ce8]/30 focus:border-[#590ce8] transition-all font-semibold"
                    required
                  />
                </div>
              </div>

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
                    placeholder="min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f0f2ff]/60 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#590ce8]/30 focus:border-[#590ce8] transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Conditional Patient Fields */}
              {role === 'patient' && (
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-12 items-center gap-2">
                    <label className="col-span-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone:</label>
                    <div className="col-span-8 relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Phone className="h-4 w-4" />
                      </span>
                      <input
                        type="tel"
                        placeholder="+1 (555) 010-0200"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#f0f2ff]/60 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#590ce8]/30 focus:border-[#590ce8] transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 items-center gap-2">
                    <label className="col-span-4 text-xs font-bold text-slate-500 uppercase tracking-wider">DOB:</label>
                    <div className="col-span-8 relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Calendar className="h-4 w-4" />
                      </span>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-[#f0f2ff]/60 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-[#590ce8]/30 focus:border-[#590ce8] transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 items-center gap-2">
                    <label className="col-span-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Address:</label>
                    <div className="col-span-8 relative">
                      <span className="absolute inset-y-0 left-0 pl-3 pt-2.5 flex items-start text-slate-400">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <textarea
                        placeholder="Street, City, Country"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-[#f0f2ff]/60 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-[#590ce8]/30 focus:border-[#590ce8] transition-all font-semibold h-16 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {role === 'doctor' && (
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-12 items-center gap-2">
                    <label className="col-span-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Specialty:</label>
                    <div className="col-span-8 relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Award className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="Cardiology, Pediatrics"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full bg-[#f0f2ff]/60 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-[#590ce8]/30 focus:border-[#590ce8] transition-all font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 items-center gap-2">
                    <label className="col-span-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Experience:</label>
                    <div className="col-span-8 relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Shield className="h-4 w-4" />
                      </span>
                      <input
                        type="number"
                        placeholder="Years of practice"
                        min="0"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full bg-[#f0f2ff]/60 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-[#590ce8]/30 focus:border-[#590ce8] transition-all font-semibold"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-1/2 bg-[#590ce8] hover:bg-[#4809c2] text-white font-bold rounded-xl py-2.5 transition-all shadow-md shadow-[#590ce8]/20 text-sm tracking-wider uppercase"
                >
                  {loading ? 'Creating...' : 'Register'}
                </button>
              </div>

            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-semibold">
                Already registered?{' '}
                <Link to="/login" className="text-[#590ce8] hover:text-[#4809c2] font-bold transition-colors">
                  Sign In
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

export default RegisterPage;
