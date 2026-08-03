import React, { useEffect, useState } from 'react';
import useAppointments from '../hooks/useAppointments';
import useAuth from '../hooks/useAuth';
import { 
  Users, Calendar, Activity, ShieldCheck, HeartPulse, UserCircle2, Shield, Award, ClipboardList, Clock, Search
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

  // Fetch all users in system
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

  // Analytics helper calculations
  const totalDoctors = users.filter(u => u.role === 'doctor').length || appointments.reduce((acc, appt) => {
    // Fallback counts if users tab not loaded yet
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

  const handleStatusChange = async (apptId, status) => {
    await updateStatus(apptId, status);
    refresh();
  };

  // Filters
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
    <div className="max-w-7xl mx-auto px-6 py-10">
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
          User Directory ({users.length || '...'})
        </button>
        <button
          onClick={() => { setActiveTab('appointments'); refresh(); }}
          className={`pb-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'appointments'
              ? 'border-primary-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          All Appointments Ledger ({appointments.length})
        </button>
      </div>

      {/* --- TAB CONTENT: OPERATIONS ANALYTICS --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-10 animate-fade-in">
          {/* Metrics cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center space-x-4">
              <div className="bg-primary-500/10 border border-primary-500/20 p-3 rounded-xl">
                <Users className="h-6 w-6 text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Registered Patients</p>
                <h3 className="text-3xl font-extrabold text-white mt-1">{totalPatients}</h3>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center space-x-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                <Award className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Doctors</p>
                <h3 className="text-3xl font-extrabold text-white mt-1">{totalDoctors}</h3>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center space-x-4">
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Bookings</p>
                <h3 className="text-3xl font-extrabold text-white mt-1">{totalAppts}</h3>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center space-x-4">
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pending Confirmations</p>
                <h3 className="text-3xl font-extrabold text-white mt-1">{pendingAppts}</h3>
              </div>
            </div>
          </div>

          {/* Quick status summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span>System Operations Status</span>
              </h3>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Consultations Completed:</span>
                  <span className="text-white font-bold">{completedAppts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Consultations Pending/Confirmed:</span>
                  <span className="text-white font-bold">{activeAppts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Database Engine:</span>
                  <span className="text-primary-400 font-bold">SQLAlchemy ORM (SQLite / PostgreSQL)</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
              <HeartPulse className="h-12 w-12 text-primary-500 animate-pulse-subtle" />
              <h3 className="text-white font-bold text-lg">Hospital Appointment Hub</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Use the tabs above to search system users, monitor active appointments, and confirm or cancel pending schedules directly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: USER DIRECTORY --- */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl flex items-center space-x-3">
            <Search className="h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search users by name, email, or role type..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm focus:outline-none placeholder-slate-500"
            />
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden overflow-x-auto">
            {userLoading ? (
              <p className="p-8 text-center text-slate-400">Loading user registry...</p>
            ) : (
              <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-800/80 text-slate-400 font-bold">
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Profile Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/20">
                      <td className="p-4 flex items-center space-x-3">
                        <UserCircle2 className="h-8 w-8 text-slate-500 shrink-0" />
                        <span className="font-semibold text-white">{u.full_name}</span>
                      </td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          u.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15' :
                          u.role === 'doctor' ? 'bg-primary-500/10 text-primary-400 border border-primary-500/15' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-xs max-w-xs truncate">
                        {u.role === 'patient' && u.patient_profile && (
                          <span>Phone: {u.patient_profile.phone || 'N/A'} | DOB: {u.patient_profile.date_of_birth || 'N/A'}</span>
                        )}
                        {u.role === 'doctor' && u.doctor_profile && (
                          <span>Specialization: {u.doctor_profile.specialization} ({u.doctor_profile.experience_years} yrs exp)</span>
                        )}
                        {u.role === 'admin' && <span className="text-slate-500">System Admin Control</span>}
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
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl flex items-center space-x-3">
            <Search className="h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search appointments by Patient name, Doctor name, or Status..."
              value={apptSearchTerm}
              onChange={(e) => setApptSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm focus:outline-none placeholder-slate-500"
            />
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden overflow-x-auto">
            {apptLoading ? (
              <p className="p-8 text-center text-slate-400">Loading ledger...</p>
            ) : (
              <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-800/80 text-slate-400 font-bold">
                    <th className="p-4">ID</th>
                    <th className="p-4">Patient</th>
                    <th className="p-4">Doctor</th>
                    <th className="p-4">Schedule (Date / Time)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredAppts.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-800/20">
                      <td className="p-4 font-mono font-bold text-slate-500">#{appt.id}</td>
                      <td className="p-4 text-white font-medium">{appt.patient?.user.full_name}</td>
                      <td className="p-4">Dr. {appt.doctor?.user.full_name}</td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-200">{appt.date}</span>
                        <span className="text-slate-500 text-xs block mt-0.5">{appt.time.substring(0, 5)}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          appt.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          appt.status === 'confirmed' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' :
                          appt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {['pending', 'confirmed'].includes(appt.status.toLowerCase()) && (
                          <>
                            {appt.status.toLowerCase() === 'pending' && (
                              <button
                                onClick={() => handleStatusChange(appt.id, 'confirmed')}
                                className="bg-primary-600 hover:bg-primary-500 text-white rounded-lg px-2.5 py-1 text-xs font-bold transition-all"
                              >
                                Confirm
                              </button>
                            )}
                            <button
                              onClick={() => handleStatusChange(appt.id, 'cancelled')}
                              className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {appt.status.toLowerCase() === 'completed' && appt.prescription && (
                          <span className="text-xs text-slate-500 font-medium">Record Closed</span>
                        )}
                        {appt.status.toLowerCase() === 'cancelled' && (
                          <span className="text-xs text-rose-500/50 font-medium">Archived</span>
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
