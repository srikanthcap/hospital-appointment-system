import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useAppointments from '../hooks/useAppointments';
import useAuth from '../hooks/useAuth';
import { 
  Calendar, Clock, User, FileText, CheckCircle2, XCircle, Plus, CalendarPlus, ListTodo, FileSpreadsheet, UserCheck, AlertCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const DoctorDashboard = () => {
  const { token, userId } = useAuth();
  
  // Redux/hooks State
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
  const [prescriptionApptId, setPrescriptionApptId] = useState(null); // Set to appointment ID to open modal
  const [prescriptionApptPatientName, setPrescriptionApptPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState('');
  const [notes, setNotes] = useState('');
  const [prescError, setPrescError] = useState(null);

  // Fetch slots for this doctor
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
      // Format times to HH:MM:SS
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
      // Clear forms
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
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Tab Selectors */}
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
              <span>Patient Consultation Requests</span>
            </h2>
            <button onClick={refresh} className="text-xs text-primary-400 font-semibold hover:text-primary-300">Refresh</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.map((appt) => (
              <div key={appt.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between border border-slate-800">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg">{appt.patient?.user.full_name}</h3>
                    <span className={`inline-flex items-center space-x-1 border px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                      appt.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      appt.status === 'confirmed' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' :
                      appt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {appt.status}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-sm text-slate-300">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>{appt.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span>{appt.time.substring(0, 5)}</span>
                    </div>
                    {appt.patient?.phone && (
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span className="font-semibold text-slate-500">Phone:</span>
                        <span>{appt.patient.phone}</span>
                      </div>
                    )}
                    {appt.reason && (
                      <div className="mt-3 bg-slate-950/40 p-3 rounded-xl border border-slate-900/50">
                        <p className="text-xs text-slate-400 uppercase font-semibold">Stated Reason</p>
                        <p className="text-slate-200 mt-1 text-sm">{appt.reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-end space-x-3">
                  {appt.status.toLowerCase() === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(appt.id, 'cancelled')}
                        className="flex items-center space-x-1 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(appt.id, 'confirmed')}
                        className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Confirm</span>
                      </button>
                    </>
                  )}

                  {appt.status.toLowerCase() === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(appt.id, 'cancelled')}
                        className="text-slate-400 hover:text-rose-400 text-xs font-semibold mr-auto transition-colors"
                      >
                        Cancel Appointment
                      </button>
                      <button
                        onClick={() => {
                          setPrescriptionApptId(appt.id);
                          setPrescriptionApptPatientName(appt.patient?.user.full_name || '');
                        }}
                        className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md shadow-emerald-950/20"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Prescribe &amp; Complete</span>
                      </button>
                    </>
                  )}

                  {appt.status.toLowerCase() === 'completed' && appt.prescription && (
                    <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 w-full text-xs space-y-1">
                      <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Prescription Attached</p>
                      <p className="text-slate-200"><strong className="text-slate-400">Diagnosis:</strong> {appt.prescription.diagnosis}</p>
                      <p className="text-slate-300 line-clamp-1"><strong className="text-slate-400">Medicines:</strong> {appt.prescription.medicines}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {appointments.length === 0 && (
              <div className="col-span-2 py-16 text-center text-slate-400 glass-panel rounded-3xl">
                <ListTodo className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                <p className="font-semibold text-base">No consultation requests</p>
                <p className="text-xs text-slate-500 mt-1">Bookings from patients will show up here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: MANAGE SCHEDULE SLOTS --- */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create slot Form */}
          <div className="glass-panel p-6 rounded-2xl h-fit border border-slate-800">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center space-x-2">
              <CalendarPlus className="h-5 w-5 text-primary-500" />
              <span>Add Availability Slot</span>
            </h2>

            {slotSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-3.5 text-xs mb-5">
                {slotSuccess}
              </div>
            )}
            {slotError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl p-3.5 text-xs mb-5 animate-pulse-subtle">
                {slotError}
              </div>
            )}

            <form onSubmit={handleAddSlot} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Day / Date</label>
                <input
                  type="date"
                  value={day}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDay(e.target.value)}
                  className="custom-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="custom-input"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="custom-input"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-1.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl py-3 transition-all mt-6 shadow-md"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>Publish Open Slot</span>
              </button>
            </form>
          </div>

          {/* List of current slots */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-primary-500" />
              <span>Current Schedule Slots</span>
            </h2>

            <div className="glass-panel rounded-3xl overflow-hidden">
              {slotLoading ? (
                <p className="p-8 text-center text-slate-400">Loading schedules...</p>
              ) : slots.length > 0 ? (
                <div className="divide-y divide-slate-800/60">
                  {slots.map((s) => (
                    <div key={s.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <span className="text-slate-200 font-medium">{s.day}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span className="text-slate-300">{s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}</span>
                        </div>
                      </div>
                      <div>
                        {s.is_booked ? (
                          <span className="inline-flex items-center space-x-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Booked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
                            <span>Open</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-8 text-center text-slate-500 text-sm">You haven't defined any availability slots yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: WRITE PRESCRIPTION --- */}
      {prescriptionApptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg p-8 rounded-3xl shadow-2xl relative border border-slate-800">
            <h3 className="text-2xl font-extrabold text-white mb-2 flex items-center space-x-2">
              <FileText className="h-7 w-7 text-emerald-500" />
              <span>Attach Prescription</span>
            </h3>
            <p className="text-sm text-slate-400 mb-6">Completing session for Patient: <strong className="text-white">{prescriptionApptPatientName}</strong></p>

            {prescError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl p-3.5 text-xs mb-5 animate-pulse-subtle">
                {prescError}
              </div>
            )}

            <form onSubmit={handlePrescribeSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Diagnosis</label>
                <input
                  type="text"
                  placeholder="e.g. Acute Viral Bronchitis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="custom-input"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Medicines (dosage/instructions)</label>
                <textarea
                  placeholder="e.g. Paracetamol 500mg - 1 tablet every 8 hours"
                  value={medicines}
                  onChange={(e) => setMedicines(e.target.value)}
                  className="custom-input h-24 resize-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Consultation / Diet Notes</label>
                <textarea
                  placeholder="e.g. Increase warm fluids, avoid heavy lifting for 3 days."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="custom-input h-16 resize-none"
                />
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setPrescriptionApptId(null);
                    setPrescError(null);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={apptLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6 py-2.5 text-sm font-bold transition-all shadow-md"
                >
                  {apptLoading ? 'Saving...' : 'Submit & Complete'}
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
