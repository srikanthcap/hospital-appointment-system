import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { User, Mail, Lock, Phone, Calendar, MapPin, Award, Shield, UserPlus, AlertCircle, CheckCircle, HeartPulse, Sparkles } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-76px)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
      
      {/* LEFT PANEL: ONBOARDING ASSISTANCE */}
      <div className="hidden lg:flex lg:col-span-5 bg-slate-950/40 relative flex-col justify-between p-12 border-r border-slate-900 overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex items-center space-x-2 text-white font-extrabold text-2xl tracking-tight z-10 animate-fade-in-up">
          <HeartPulse className="h-8 w-8 text-primary-500 animate-pulse-glow" />
          <span>CareFlow</span>
        </div>

        <div className="my-auto space-y-6 z-10 max-w-sm">
          <span className="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="h-3 w-3" />
            <span>Join Our Network</span>
          </span>
          <h2 className="text-3xl font-extrabold text-white leading-snug">
            Step into the next era of health consultation.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            By creating an account, patients gain instant booking power to specialized clinics, while medical staff acquire state-of-the-art tools to manage patient queues and draft digital prescriptions.
          </p>
        </div>

        <div className="border-t border-slate-900 pt-8 z-10 animate-fade-in-up">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Security First Platform</p>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            All user data, health profiles, and consultation histories are encrypted and protected securely according to privacy legislation.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: SIGNUP FORM */}
      <div className="lg:col-span-7 flex items-center justify-center px-6 py-8 relative overflow-y-auto">
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none -z-10" />

        <div className="glass-panel w-full max-w-xl p-8 sm:p-10 rounded-3xl border border-slate-800/80 shadow-2xl animate-fade-in-up my-6">
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
            <p className="mt-1 text-sm text-slate-400">Fill in details to set up your health portal.</p>
          </div>

          {/* Dynamic Role Switcher Toggles */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => { setRole('patient'); setLocalError(null); }}
              className={`flex items-center justify-center space-x-2 p-3 rounded-2xl border transition-all duration-200 ${
                role === 'patient'
                  ? 'bg-primary-600/10 border-primary-500 text-primary-400 font-bold'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700/80'
              }`}
            >
              <User className="h-4.5 w-4.5" />
              <span className="text-sm font-semibold">I'm a Patient</span>
            </button>
            <button
              type="button"
              onClick={() => { setRole('doctor'); setLocalError(null); }}
              className={`flex items-center justify-center space-x-2 p-3 rounded-2xl border transition-all duration-200 ${
                role === 'doctor'
                  ? 'bg-primary-600/10 border-primary-500 text-primary-400 font-bold'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700/80'
              }`}
            >
              <Award className="h-4.5 w-4.5" />
              <span className="text-sm font-semibold">I'm a Doctor</span>
            </button>
          </div>

          {/* Alerts */}
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-2xl p-4 flex items-start space-x-3 text-sm mb-6">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>{successMsg}</div>
            </div>
          )}
          {(localError || error) && (
            <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-2xl p-4 flex items-start space-x-3 text-sm mb-6 animate-pulse-glow">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error:</span> {localError || error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Core User Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-350 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="custom-input pl-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-350 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="email"
                    placeholder="you@careflow.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="custom-input pl-11"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-350 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  placeholder="Create a password (min. 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="custom-input pl-11"
                  required
                />
              </div>
            </div>

            {/* CONDITIONAL PATIENT REGISTRATION FIELDS */}
            {role === 'patient' && (
              <div className="space-y-5 pt-4 border-t border-slate-800/80 animate-fade-in-up">
                <h3 className="text-white font-bold text-sm">Patient Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Phone Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600">
                        <Phone className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="tel"
                        placeholder="+1 (555) 010-0200"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="custom-input pl-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Date of Birth</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600">
                        <Calendar className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="custom-input pl-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Residential Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 flex items-start text-slate-600">
                      <MapPin className="h-4.5 w-4.5" />
                    </span>
                    <textarea
                      placeholder="Street address, building, city, state"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="custom-input pl-11 h-20 resize-none pt-3"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === 'doctor' && (
              <div className="space-y-5 pt-4 border-t border-slate-800/80 animate-fade-in-up">
                <h3 className="text-white font-bold text-sm">Specialist Credentials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Specialization Division</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600">
                        <Award className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. Pediatrics, Neurology"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="custom-input pl-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Years of Experience</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600">
                        <Shield className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="number"
                        placeholder="e.g. 8"
                        min="0"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="custom-input pl-11"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                  <span>Creating profiles...</span>
                </span>
              ) : (
                <>
                  <UserPlus className="h-4.5 w-4.5" />
                  <span>Onboard to Platform</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-sm text-slate-400">
              Already a user?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RegisterPage;
