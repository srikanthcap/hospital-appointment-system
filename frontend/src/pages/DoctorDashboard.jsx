import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useAppointments from '../hooks/useAppointments';
import useAuth from '../hooks/useAuth';
import { 
  Calendar, Clock, User, FileText, CheckCircle2, XCircle, Plus, CalendarPlus, ListTodo, FileSpreadsheet, UserCheck, AlertCircle, HeartPulse, MapPin
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const DoctorDashboard = () => {
  const { token, userId } = useAuth();
  
  // Hook State
  const { appointments, loading: apptLoading, error: apptError, updateStatus, prescribe, refresh } = useAppointments();

  // Local UI States
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments', 'schedule'
  const [slots, setSlots] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);

  // New slot form states
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [slotError, setSlotError] = useState(null);
  const [slotSuccess, setSlotSuccess] = useState(null);

  // Prescription modal form states
  const [prescriptionApptId, setPrescriptionApptId] = useState(null);
  const [prescriptionApptPatientName, setPrescriptionApptPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState('');
  const [notes, setNotes] = useState('');
  const [prescError, setPrescError] = useState(null);

  const fetchMySlots = async () => {
    setSlotLoading(true);
    try {
      const response = await fetch(`${API_URL}/doctors/${userId}/schedule?only_available=false`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSlots(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSlotLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'schedule') {
      fetchMySlots();
    }
  }, [activeTab]);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setSlotError(null);
    setSlotSuccess(null);

    if (!day || !startTime || !endTime) {
      setSlotError('Please fill in all slot fields.');
      return;
    }

    try {
      const formattedStart = startTime.length === 5 ? `${startTime}:00` : startTime;
      const formattedEnd = endTime.length === 5 ? `${endTime}:00` : endTime;

      const response = await fetch(`${API_URL}/doctors/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          day,
          start_time: formattedStart,
          end_time: formattedEnd
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create schedule slot.');
      }

      setSlotSuccess('Availability slot created successfully!');
      setDay('');
      setStartTime('');
      setEndTime('');
      fetchMySlots();
    } catch (err) {
      setSlotError(err.message);
    }
  };

  const handlePrescribeSubmit = async (e) => {
    e.preventDefault();
    setPrescError(null);

    if (!diagnosis || !medicines) {
      setPrescError('Diagnosis and medicines are required.');
      return;
    }

    const success = await prescribe(prescriptionApptId, diagnosis, medicines, notes);
    if (success) {
      setPrescriptionApptId(null);
      setPrescriptionApptPatientName('');
      setDiagnosis('');
      setMedicines('');
      setNotes('');
      refresh();
    } else {
      setPrescError(apptError || 'Failed to submit prescription.');
    }
  };

  const handleStatusChange = async (apptId, newStatus) => {
    await updateStatus(apptId, newStatus);
    refresh();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in-up">
      
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Physician Portal</h1>
        <p className="text-slate-400 text-sm mt-1">Manage consultation lists, coordinate schedules, and assign medical scripts.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/80 space-x-6 mb-8">
        <button
          onClick={() => { setActiveTab('appointments'); refresh(); }}
          className={`pb-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'appointments'
              ? 'border-primary-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          My Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'schedule'
              ? 'border-primary-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Manage Availability Slots
        </button>
      </div>

      {/* --- TAB CONTENT: MY APPOINTMENTS --- */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <ListTodo className="h-5 w-5 text-primary-500" />
              <span>Consultation Queue</span>
            </h2>
            <button onClick={refresh} className="text-xs text-primary-400 font-semibold hover:text-primary-300">Refresh Queue</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.map((appt) => {
              const initials = appt.patient?.user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2);
              return (
                <div key={appt.id} className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-700/60 transition-all duration-200">
                  <div>
                    <div className="flex items-start justify-between mb-4 border-b border-slate-900 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-primary-600/10 text-primary-400 font-bold border border-primary-500/15 rounded-xl flex items-center justify-center text-xs shrink-0">
                          {initials}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-base">{appt.patient?.user.full_name}</h3>
                          <p className="text-[10px] text-slate-500 mt-0.5">Patient ID: #{appt.patient_id}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        appt.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        appt.status === 'confirmed' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                        appt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {appt.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex items-center space-x-2 text-xs">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span>Date: <strong className="text-slate-200">{appt.date}</strong></span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span>Hour: <strong className="text-slate-200">{appt.time.substring(0, 5)}</strong></span>
                      </div>
                      {appt.patient?.phone && (
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <span className="font-semibold text-slate-500">Contact:</span>
                          <span>{appt.patient.phone}</span>
                        </div>
                      )}
                      {appt.reason && (
                        <div className="mt-4 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-900/60 text-xs">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Symptoms / Reason</p>
                          <p className="text-slate-300 mt-1 leading-relaxed">{appt.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-end space-x-3">
                    {appt.status.toLowerCase() === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(appt.id, 'cancelled')}
                          className="flex items-center space-x-1 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl px-3 py-2 text-xs font-semibold transition-all"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Decline</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(appt.id, 'confirmed')}
                          className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Accept Request</span>
                        </button>
                      </>
                    )}

                    {appt.status.toLowerCase() === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(appt.id, 'cancelled')}
                          className="text-slate-500 hover:text-rose-400 text-xs font-semibold mr-auto transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setPrescriptionApptId(appt.id);
                            setPrescriptionApptPatientName(appt.patient?.user.full_name || '');
                          }}
                          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-md"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Write Prescription &amp; Complete</span>
                        </button>
                      </>
                    )}

                    {appt.status.toLowerCase() === 'completed' && appt.prescription && (
                      <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-3.5 w-full text-xs space-y-1">
                        <p className="text-emerald-450 font-bold uppercase tracking-wider text-[10px]">Medical Slip Attached</p>
                        <p className="text-slate-200"><strong className="text-slate-500">Diagnosis:</strong> {appt.prescription.diagnosis}</p>
                        <p className="text-slate-350 line-clamp-1"><strong className="text-slate-500">Medicines:</strong> {appt.prescription.medicines}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {appointments.length === 0 && (
              <div className="col-span-2 py-16 text-center text-slate-400 glass-panel rounded-3xl border border-slate-850">
                <ListTodo className="h-12 w-12 text-slate-800 mx-auto mb-3" />
                <p className="font-bold text-slate-300">Queue is empty</p>
                <p className="text-xs text-slate-500 mt-1">Incoming bookings from patients will show up here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: MANAGE SCHEDULE SLOTS --- */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Create slot form */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-800/80 h-fit">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center space-x-2">
              <CalendarPlus className="h-5 w-5 text-primary-500" />
              <span>Add Availability Slot</span>
            </h2>

            {slotSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl p-3.5 text-xs mb-5">
                {slotSuccess}
              </div>
            )}
            {slotError && (
              <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl p-3.5 text-xs mb-5 animate-pulse-glow">
                {slotError}
              </div>
            )}

            <form onSubmit={handleAddSlot} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-350 uppercase tracking-wider block">Date</label>
                <input
                  type="date"
                  value={day}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDay(e.target.value)}
                  className="custom-input text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-350 uppercase tracking-wider block">Start Hour</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="custom-input text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-350 uppercase tracking-wider block">End Hour</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="custom-input text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-1.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl py-3.5 transition-all mt-6 shadow-md"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>Publish Schedule Slot</span>
              </button>
            </form>
          </div>

          {/* List of current slots */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-primary-500" />
              <span>Current Availability Ledger</span>
            </h2>

            <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
              {slotLoading ? (
                <p className="p-8 text-center text-slate-400">Loading slots...</p>
              ) : slots.length > 0 ? (
                <div className="divide-y divide-slate-900/60 text-sm">
                  {slots.map((s) => (
                    <div key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-800/10">
                      <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <span className="font-semibold">{s.day}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span>{s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}</span>
                        </div>
                      </div>
                      <div>
                        {s.is_booked ? (
                          <span className="inline-flex items-center space-x-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Booked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            <span>Open</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-8 text-center text-slate-500">No slots defined yet.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* --- MODAL: WRITE PRESCRIPTION (HIGH FIDELITY RX PAD) --- */}
      {prescriptionApptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="prescription-slip w-full max-w-lg rounded-3xl p-8 relative border border-slate-300 shadow-2xl animate-fade-in-up">
            
            {/* Stamp Logo / Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-300 pb-4 mb-5">
              <div className="flex items-center space-x-3">
                <HeartPulse className="h-9 w-9 text-rose-600" />
                <div>
                  <h3 className="font-black text-lg text-slate-900 tracking-tight uppercase">CareFlow Clinic</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Clinical Prescriptions Editor</p>
                </div>
              </div>
              <div className="text-right text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                <p>New Rx Record</p>
                <p>Appt ID: #{prescriptionApptId}</p>
              </div>
            </div>

            {/* Target Patient Info */}
            <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700 mb-5">
              Patient Name: <strong className="text-slate-950 font-bold">{prescriptionApptPatientName}</strong>
            </div>

            {prescError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 rounded-xl p-3 text-xs mb-4">
                {prescError}
              </div>
            )}

            <form onSubmit={handlePrescribeSubmit} className="space-y-4 text-slate-800">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Clinical Diagnosis</label>
                <input
                  type="text"
                  placeholder="e.g. Acute Pharyngitis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm font-semibold transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-1 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-rose-600 font-black text-xs">Rx</span>
                  <span>Medicines &amp; Dosages</span>
                </div>
                <textarea
                  placeholder="e.g. Amoxicillin 500mg - 1 capsule twice daily for 7 days"
                  value={medicines}
                  onChange={(e) => setMedicines(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm font-semibold transition-all h-24 resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Consultation Guidance Notes</label>
                <textarea
                  placeholder="e.g. Bed rest, avoid cold fluids, follow-up in 1 week if fever persists."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xs font-medium transition-all h-16 resize-none"
                />
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200/80 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setPrescriptionApptId(null);
                    setPrescError(null);
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl px-4 py-2 text-xs font-bold transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={apptLoading}
                  className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl px-5 py-2 text-xs font-bold transition-all shadow-md"
                >
                  {apptLoading ? 'Publishing...' : 'Sign & Complete Rx'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorDashboard;
