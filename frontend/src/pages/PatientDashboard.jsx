import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors, fetchDoctorSchedule, selectDoctor } from '../store/doctorSlice';
import useAppointments from '../hooks/useAppointments';
import useAuth from '../hooks/useAuth';
import { 
  User, Calendar, Clock, BookOpen, FileText, CheckCircle, Clock3, AlertCircle, XCircle, Search, FileHeart, CalendarCheck
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const PatientDashboard = () => {
  const dispatch = useDispatch();
  const { userId, token } = useAuth();
  
  // Redux state
  const { doctors, selectedDoctorId, selectedDoctorSchedule, loading: docLoading } = useSelector((state) => state.doctor);
  const { appointments, loading: apptLoading, error: apptError, successMsg, book, clearMessages, refresh } = useAppointments();

  // Local UI states
  const [activeTab, setActiveTab] = useState('book'); // 'book', 'appointments', 'prescriptions'
  const [reason, setReason] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null); // DoctorSchedule object
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescLoading, setPrescLoading] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null); // For detail modal

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Initial fetches
  useEffect(() => {
    dispatch(fetchDoctors());
    clearMessages();
  }, [dispatch]);

  // Fetch slots when a doctor is selected
  useEffect(() => {
    if (selectedDoctorId) {
      dispatch(fetchDoctorSchedule({ doctorId: selectedDoctorId, onlyAvailable: true }));
      setSelectedSlot(null);
    }
  }, [selectedDoctorId, dispatch]);

  // Fetch prescription history
  const fetchPrescriptions = async () => {
    setPrescLoading(true);
    try {
      const response = await fetch(`${API_URL}/prescriptions/history/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPrescLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'prescriptions') {
      fetchPrescriptions();
    }
  }, [activeTab]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    const payload = {
      doctor_id: selectedSlot.doctor_id,
      schedule_id: selectedSlot.id,
      date: selectedSlot.day,
      time: selectedSlot.start_time,
      reason: reason
    };

    const success = await book(payload);
    if (success) {
      setReason('');
      setSelectedSlot(null);
      // Refresh doctor's open slots
      dispatch(fetchDoctorSchedule({ doctorId: selectedDoctorId, onlyAvailable: true }));
      // Auto switch to appointments tab
      setActiveTab('appointments');
    }
  };

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    if (s === 'pending') return <span className="inline-flex items-center space-x-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-semibold uppercase"><Clock3 className="h-3 w-3" /> <span>Pending</span></span>;
    if (s === 'confirmed') return <span className="inline-flex items-center space-x-1 bg-primary-500/10 text-primary-400 border border-primary-500/20 px-2.5 py-1 rounded-full text-xs font-semibold uppercase"><CheckCircle className="h-3 w-3" /> <span>Confirmed</span></span>;
    if (s === 'completed') return <span className="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-semibold uppercase"><CheckCircle className="h-3 w-3" /> <span>Completed</span></span>;
    return <span className="inline-flex items-center space-x-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full text-xs font-semibold uppercase"><XCircle className="h-3 w-3" /> <span>Cancelled</span></span>;
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.doctor_profile?.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Dashboard Tabs */}
      <div className="flex border-b border-slate-800/80 space-x-6 mb-8">
        <button
          onClick={() => setActiveTab('book')}
          className={`pb-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'book'
              ? 'border-primary-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Book Consultation
        </button>
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
          onClick={() => setActiveTab('prescriptions')}
          className={`pb-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'prescriptions'
              ? 'border-primary-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Prescription History
        </button>
      </div>

      {/* --- TAB CONTENT: BOOK CONSULTATION --- */}
      {activeTab === 'book' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of Doctors */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Search className="h-5 w-5 text-primary-500" />
                <span>Search Specialists</span>
              </h2>
              <input
                type="text"
                placeholder="Search by specialist name or medical division..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="custom-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => dispatch(selectDoctor(doc.id))}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-150 flex items-start space-x-4 ${
                    selectedDoctorId === doc.id
                      ? 'bg-primary-600/10 border-primary-500/80 shadow-md'
                      : 'glass-panel border-slate-800 hover:border-slate-700/80'
                  }`}
                >
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                    <User className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-white font-semibold">{doc.full_name}</h3>
                    <p className="text-xs text-primary-400 font-medium capitalize mt-1">
                      {doc.doctor_profile?.specialization}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {doc.doctor_profile?.experience_years} years experience
                    </p>
                  </div>
                </div>
              ))}

              {filteredDoctors.length === 0 && (
                <p className="text-sm text-slate-500 col-span-2 py-8 text-center">No specialists found matching filters.</p>
              )}
            </div>
          </div>

          {/* Schedule slots & Book Form */}
          <div className="space-y-6">
            {selectedDoctorId ? (
              <div className="glass-panel p-6 rounded-2xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Select Availability Slot</h3>
                  <p className="text-xs text-slate-400 mt-1">Choose an open timing to book</p>
                </div>

                {docLoading ? (
                  <p className="text-sm text-slate-400">Loading schedules...</p>
                ) : selectedDoctorSchedule.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto pr-2">
                    {selectedDoctorSchedule.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-sm font-medium transition-all ${
                          selectedSlot?.id === slot.id
                            ? 'bg-primary-600 border-primary-500 text-white'
                            : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="flex items-center space-x-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{slot.day}</span>
                        </span>
                        <span className="flex items-center space-x-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-rose-400/80 bg-rose-500/5 border border-rose-500/10 rounded-xl p-3">
                    No active slots available. Please check back later.
                  </p>
                )}

                {/* Booking Form */}
                {selectedSlot && (
                  <form onSubmit={handleBook} className="space-y-4 pt-4 border-t border-slate-800/85">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Reason for visit</label>
                      <textarea
                        placeholder="Describe symptoms, follow-up reason, etc."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="custom-input h-20 resize-none"
                        required
                      />
                    </div>

                    {apptError && (
                      <p className="text-xs text-rose-400 bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">
                        {apptError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={apptLoading}
                      className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl py-3.5 transition-all shadow-md"
                    >
                      <CalendarCheck className="h-4.5 w-4.5" />
                      <span>{apptLoading ? 'Booking...' : 'Book Appointment'}</span>
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 flex flex-col items-center justify-center">
                <BookOpen className="h-10 w-10 text-slate-600 mb-3" />
                <p className="text-sm font-semibold">Select a Specialist</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Choose a doctor from the list to view their schedule and configure your booking.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: MY APPOINTMENTS --- */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Your Booked Appointments</h2>
            <button onClick={refresh} className="text-xs text-primary-400 font-semibold hover:text-primary-300">Refresh</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.map((appt) => (
              <div key={appt.id} className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg">Dr. {appt.doctor?.user.full_name}</h3>
                    {getStatusBadge(appt.status)}
                  </div>
                  
                  <p className="text-xs text-primary-400 font-medium capitalize -mt-2.5 mb-4">
                    {appt.doctor?.specialization}
                  </p>

                  <div className="space-y-2.5 text-sm text-slate-300">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{appt.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>{appt.time.substring(0, 5)}</span>
                    </div>
                    {appt.reason && (
                      <div className="mt-3 bg-slate-950/40 p-3 rounded-xl border border-slate-900/50">
                        <p className="text-xs text-slate-400 uppercase font-semibold">Reason</p>
                        <p className="text-slate-200 mt-1 text-sm">{appt.reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Viewing Prescription Button if completed */}
                {appt.status.toLowerCase() === 'completed' && (
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex justify-end">
                    {appt.prescription ? (
                      <button
                        onClick={() => setSelectedPrescription(appt.prescription)}
                        className="flex items-center space-x-1.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-xl px-4 py-2 text-xs font-bold transition-all"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>View Prescription</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">Prescription pending</span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {appointments.length === 0 && (
              <div className="col-span-2 py-16 text-center text-slate-400 glass-panel rounded-3xl">
                <Calendar className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                <p className="font-semibold text-base">No appointments booked yet</p>
                <p className="text-xs text-slate-500 mt-1">Schedules you book will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: PRESCRIPTION HISTORY --- */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <FileHeart className="h-5 w-5 text-emerald-500" />
              <span>Full Medical &amp; Prescription History</span>
            </h2>
            <button onClick={fetchPrescriptions} className="text-xs text-emerald-400 font-semibold hover:text-emerald-300">Reload</button>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden">
            {prescLoading ? (
              <div className="py-12 text-center text-slate-400">Loading records...</div>
            ) : prescriptions.length > 0 ? (
              <div className="divide-y divide-slate-800/60">
                {prescriptions.map((presc) => {
                  // Find related appointment if possible
                  const relatedAppt = appointments.find(a => a.id === presc.appointment_id);
                  return (
                    <div key={presc.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="text-white font-bold text-base">
                          Diagnosis: <span className="text-emerald-400">{presc.diagnosis}</span>
                        </h3>
                        <p className="text-sm text-slate-300 mt-1.5 max-w-xl">
                          <strong className="text-slate-400">Medicines:</strong> {presc.medicines}
                        </p>
                        {presc.notes && (
                          <p className="text-xs text-slate-400 mt-1">
                            <strong className="text-slate-500">Doctor Notes:</strong> {presc.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 shrink-0">
                        {relatedAppt && (
                          <div className="text-right text-xs text-slate-500">
                            <p className="font-semibold text-slate-400">Dr. {relatedAppt.doctor?.user.full_name}</p>
                            <p>{relatedAppt.date}</p>
                          </div>
                        )}
                        <button
                          onClick={() => setSelectedPrescription(presc)}
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400">
                <FileText className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                <p className="font-semibold text-base">No prescriptions found</p>
                <p className="text-xs text-slate-500 mt-1">Records will populate here after a completed consultation.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- DETAIL MODAL: VIEW PRESCRIPTION --- */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg p-8 rounded-3xl shadow-2xl relative border border-slate-800">
            <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center space-x-2">
              <FileHeart className="h-7 w-7 text-emerald-500" />
              <span>Prescription Summary</span>
            </h3>

            <div className="space-y-6">
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnosis</label>
                <p className="text-white font-bold text-lg mt-1">{selectedPrescription.diagnosis}</p>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prescribed Medicines</label>
                <p className="text-slate-200 mt-1 whitespace-pre-line text-sm leading-relaxed">{selectedPrescription.medicines}</p>
              </div>

              {selectedPrescription.notes && (
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Additional Doctor Notes</label>
                  <p className="text-slate-300 mt-1 text-sm leading-relaxed">{selectedPrescription.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedPrescription(null)}
                className="bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-6 py-2.5 text-sm font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
