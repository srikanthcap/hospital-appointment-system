import React, { useEffect, useState } from 'react';
import useAppointments from '../hooks/useAppointments';
import useAuth from '../hooks/useAuth';
import { 
  Users, Calendar, Activity, ShieldCheck, HeartPulse, UserCircle2, Shield, Award, ClipboardList, Clock, Search, RefreshCw
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const AdminDashboard = () => {
  const { token } = useAuth();
  const { appointments, loading: apptLoading, updateStatus, refresh } = useAppointments();

  // Local UI States
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'users', 'appointments'
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [apptSearchTerm, setApptSearchTerm] = useState('');

  const fetchAllUsers = async () => {
    setUserLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchAllUsers();
    }
  }, [activeTab]);

  // Analytics Helpers
  const totalDoctors = users.filter(u => u.role === 'doctor').length || appointments.reduce((acc, appt) => {
    if (!acc.includes(appt.doctor_id)) acc.push(appt.doctor_id);
    return acc;
  }, []).length;
  
  const totalPatients = users.filter(u => u.role === 'patient').length || appointments.reduce((acc, appt) => {
    if (!acc.includes(appt.patient_id)) acc.push(appt.patient_id);
    return acc;
  }, []).length;

  const totalAppts = appointments.length;
  const pendingAppts = appointments.filter(a => a.status.toLowerCase() === 'pending').length;
  const completedAppts = appointments.filter(a => a.status.toLowerCase() === 'completed').length;
  const activeAppts = appointments.filter(a => ['pending', 'confirmed'].includes(a.status.toLowerCase())).length;

  // Percentage for progress bars
  const completedPercentage = totalAppts > 0 ? Math.round((completedAppts / totalAppts) * 100) : 0;
  const pendingPercentage = totalAppts > 0 ? Math.round((pendingAppts / totalAppts) * 100) : 0;

  const handleStatusChange = async (apptId, status) => {
    await updateStatus(apptId, status);
    refresh();
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredAppts = appointments.filter(a => 
    a.patient?.user.full_name.toLowerCase().includes(apptSearchTerm.toLowerCase()) ||
    a.doctor?.user.full_name.toLowerCase().includes(apptSearchTerm.toLowerCase()) ||
    a.status.toLowerCase().includes(apptSearchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in-up">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Operations Console</h1>
          <p className="text-slate-400 text-sm mt-1">Supervise care networks, user registries, and booking records.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/80 space-x-6 mb-8">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'analytics'
              ? 'border-primary-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Operations Analytics
        </button>
        <button
          onClick={() => { setActiveTab('users'); fetchAllUsers(); }}
          className={`pb-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-primary-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          User Registry ({users.length || '...'})
        </button>
        <button
          onClick={() => { setActiveTab('appointments'); refresh(); }}
          className={`pb-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'appointments'
              ? 'border-primary-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Master Appointments Ledger ({appointments.length})
        </button>
      </div>

      {/* --- TAB CONTENT: OPERATIONS ANALYTICS --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
              <div className="bg-primary-500/10 border border-primary-500/20 p-3.5 rounded-2xl shrink-0">
                <Users className="h-6 w-6 text-primary-400 animate-pulse-glow" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Patients Registered</p>
                <h3 className="text-3xl font-extrabold text-white mt-0.5">{totalPatients}</h3>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl shrink-0">
                <Award className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Physicians Onboarded</p>
                <h3 className="text-3xl font-extrabold text-white mt-0.5">{totalDoctors}</h3>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-2xl shrink-0">
                <Calendar className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Bookings</p>
                <h3 className="text-3xl font-extrabold text-white mt-0.5">{totalAppts}</h3>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
              <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl shrink-0">
                <Clock className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pending Bookings</p>
                <h3 className="text-3xl font-extrabold text-white mt-0.5">{pendingAppts}</h3>
              </div>
            </div>
          </div>

          {/* Progress bar cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span>Service Execution Status</span>
              </h3>
              
              <div className="space-y-4 pt-2">
                {/* Completed appts progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Completed consultations</span>
                    <span className="text-emerald-400 font-bold">{completedPercentage}% ({completedAppts})</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${completedPercentage}%` }} />
                  </div>
                </div>

                {/* Pending appts progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Pending clinic approvals</span>
                    <span className="text-amber-400 font-bold">{pendingPercentage}% ({pendingAppts})</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${pendingPercentage}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center p-8 space-y-3">
              <HeartPulse className="h-12 w-12 text-primary-500 animate-pulse-glow" />
              <h3 className="text-white font-extrabold text-lg">Hospital Operations Node</h3>
              <p className="text-xs text-slate-450 max-w-sm leading-relaxed">
                CareFlow administrators hold system overrides. Toggle tabs above to view granular patient metadata or override appointments.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* --- TAB CONTENT: USER REGISTRY --- */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="glass-panel p-4 rounded-2xl flex items-center space-x-3">
            <Search className="h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search user directories by email, role, or name..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-200 focus:outline-none placeholder-slate-600"
            />
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden overflow-x-auto border border-slate-800">
            {userLoading ? (
              <p className="p-8 text-center text-slate-400">Loading directory registries...</p>
            ) : (
              <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-850 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <th className="p-4">Staff / Patient Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Assigned Role</th>
                    <th className="p-4">Demographics &amp; Division</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60 text-slate-300">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/10">
                      <td className="p-4 flex items-center space-x-3">
                        <UserCircle2 className="h-8 w-8 text-slate-600 shrink-0" />
                        <span className="font-bold text-white text-sm">{u.full_name}</span>
                      </td>
                      <td className="p-4 text-xs font-semibold text-slate-400">{u.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                          u.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border-rose-500/15' :
                          u.role === 'doctor' ? 'bg-primary-500/10 text-primary-400 border-primary-500/15' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-400">
                        {u.role === 'patient' && u.patient_profile && (
                          <span>Phone: {u.patient_profile.phone || 'N/A'} | DOB: {u.patient_profile.date_of_birth || 'N/A'}</span>
                        )}
                        {u.role === 'doctor' && u.doctor_profile && (
                          <span>Specialization: {u.doctor_profile.specialization} ({u.doctor_profile.experience_years} yrs exp)</span>
                        )}
                        {u.role === 'admin' && <span className="text-slate-500">Security Clearance Level 1</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: ALL APPOINTMENTS LEDGER --- */}
      {activeTab === 'appointments' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="glass-panel p-4 rounded-2xl flex items-center space-x-3">
            <Search className="h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search ledger by Patient, Specialist, or Status..."
              value={apptSearchTerm}
              onChange={(e) => setApptSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-200 focus:outline-none placeholder-slate-600"
            />
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden overflow-x-auto border border-slate-800">
            {apptLoading ? (
              <p className="p-8 text-center text-slate-400">Loading database records...</p>
            ) : (
              <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-850 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <th className="p-4">Record ID</th>
                    <th className="p-4">Patient Profile</th>
                    <th className="p-4">Medical Specialist</th>
                    <th className="p-4">Calendar &amp; Hour</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">System Overrides</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60 text-slate-350">
                  {filteredAppts.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-900/10">
                      <td className="p-4 font-mono font-bold text-slate-550 text-xs">#{appt.id}</td>
                      <td className="p-4 text-white font-bold text-sm">{appt.patient?.user.full_name}</td>
                      <td className="p-4 text-xs font-semibold text-slate-300">Dr. {appt.doctor?.user.full_name}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-200 text-xs">{appt.date}</span>
                        <span className="text-slate-500 text-[10px] block mt-0.5">{appt.time.substring(0, 5)}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                          appt.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/15' :
                          appt.status === 'confirmed' ? 'bg-sky-500/10 text-sky-400 border-sky-500/15' :
                          appt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/15'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2 shrink-0">
                        {['pending', 'confirmed'].includes(appt.status.toLowerCase()) && (
                          <>
                            {appt.status.toLowerCase() === 'pending' && (
                              <button
                                onClick={() => handleStatusChange(appt.id, 'confirmed')}
                                className="bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-3 py-1.5 text-xs font-bold transition-all"
                              >
                                Confirm
                              </button>
                            )}
                            <button
                              onClick={() => handleStatusChange(appt.id, 'cancelled')}
                              className="bg-rose-500/10 hover:bg-rose-500 text-rose-450 hover:text-white border border-rose-500/15 rounded-xl px-3 py-1.5 text-xs font-bold transition-all"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {appt.status.toLowerCase() === 'completed' && (
                          <span className="text-xs text-slate-500 font-semibold italic">Session Closed</span>
                        )}
                        {appt.status.toLowerCase() === 'cancelled' && (
                          <span className="text-xs text-rose-500/40 font-semibold">Cancelled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
