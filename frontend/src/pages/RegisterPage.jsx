import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { User, Mail, Lock, Phone, Calendar, MapPin, Award, Shield, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

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

  // If already logged in, redirect
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

    // Build conditional payload
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
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="glass-panel w-full max-w-xl p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-800 my-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="mt-2.5 text-sm text-slate-400">Join CareFlow to manage your consultations</p>
        </div>

        {/* Role Picker Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => { setRole('patient'); setLocalError(null); }}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${
              role === 'patient'
                ? 'bg-primary-600/20 border-primary-500 text-white shadow-md'
                : 'bg-slate-950/20 border-slate-800 text-slate-400 hover:border-slate-700/80 hover:text-slate-300'
            }`}
          >
            <User className="h-6 w-6 mb-2" />
            <span className="font-bold text-sm">Register as Patient</span>
          </button>
          <button
            type="button"
            onClick={() => { setRole('doctor'); setLocalError(null); }}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${
              role === 'doctor'
                ? 'bg-primary-600/20 border-primary-500 text-white shadow-md'
                : 'bg-slate-950/20 border-slate-800 text-slate-400 hover:border-slate-700/80 hover:text-slate-300'
            }`}
          >
            <Award className="h-6 w-6 mb-2" />
            <span className="font-bold text-sm">Register as Doctor</span>
          </button>
        </div>

        {/* Success / Error Messages */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl p-4 flex items-start space-x-3 text-sm mb-6">
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>{successMsg}</div>
          </div>
        )}
        {(localError || error) && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl p-4 flex items-start space-x-3 text-sm mb-6 animate-pulse-subtle">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Error:</span> {localError || error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shared Basic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
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

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="custom-input pl-11"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="custom-input pl-11"
                required
              />
            </div>
          </div>

          {/* Conditional Patient Fields */}
          {role === 'patient' && (
            <div className="space-y-6 pt-4 border-t border-slate-800/80">
              <h3 className="text-white font-bold text-base">Patient Profile Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Phone className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="custom-input pl-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Date of Birth</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
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

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Residential Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 flex items-start text-slate-500">
                    <MapPin className="h-4.5 w-4.5" />
                  </span>
                  <textarea
                    placeholder="Street name, City, Country"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="custom-input pl-11 h-20 resize-none pt-3"
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'doctor' && (
            <div className="space-y-6 pt-4 border-t border-slate-800/80">
              <h3 className="text-white font-bold text-base">Doctor Profile Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Specialization</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Award className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Cardiology, Pediatrics"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="custom-input pl-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Experience (Years)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Shield className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="number"
                      placeholder="e.g. 5"
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

          {/* Submit button */}
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
                <span>Registering Account...</span>
              </span>
            ) : (
              <>
                <UserPlus className="h-4.5 w-4.5" />
                <span>Register</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
