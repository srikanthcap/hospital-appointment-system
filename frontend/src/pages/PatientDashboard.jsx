import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors, fetchDoctorSchedule, selectDoctor } from '../store/doctorSlice';
import useAppointments from '../hooks/useAppointments';
import useAuth from '../hooks/useAuth';
import { 
  User, Calendar, Clock, BookOpen, FileText, CheckCircle, Clock3, AlertCircle, XCircle, Search, FileHeart, CalendarCheck, MapPin, Phone, Printer
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const PatientDashboard = () => {
  const dispatch = useDispatch();
  const { userId, token } = useAuth();
  
  // Redux/Hook states
  const { doctors, selectedDoctorId, selectedDoctorSchedule, loading: docLoading } = useSelector((state) => state.doctor);
  const { appointments, loading: apptLoading, error: apptError, successMsg, book, clearMessages, refresh } = useAppointments();

  // Local UI states
  const [activeTab, setActiveTab] = useState('book'); // 'book', 'appointments', 'prescriptions'
  const [reason, setReason] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescLoading, setPrescLoading] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null); // Prescription details modal

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchDoctors());
    clearMessages();
  }, [dispatch]);

  useEffect(() => {
    if (selectedDoctorId) {
      dispatch(fetchDoctorSchedule({ doctorId: selectedDoctorId, onlyAvailable: true }));
      setSelectedSlot(null);
    }
  }, [selectedDoctorId, dispatch]);

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
      dispatch(fetchDoctorSchedule({ doctorId: selectedDoctorId, onlyAvailable: true }));
      setActiveTab('appointments');
    }
  };

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    if (s === 'pending') return <span className="inline-flex items-center space-x-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"><Clock3 className="h-3 w-3" /> <span>Pending</span></span>;
    if (s === 'confirmed') return <span className="inline-flex items-center space-x-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"><CheckCircle className="h-3 w-3" /> <span>Confirmed</span></span>;
    if (s === 'completed') return <span className="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"><CheckCircle className="h-3 w-3" /> <span>Completed</span></span>;
    return <span className="inline-flex items-center space-x-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"><XCircle className="h-3 w-3" /> <span>Cancelled</span></span>;
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.doctor_profile?.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in-up">
      
      {/* Dashboard Sub-Header / Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Patient Console</h1>
        <p className="text-slate-400 text-sm mt-1">Book consultation schedules, track visits, and view clinical prescriptions.</p>
      </div>

      {/* Tabs Layout */}
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
          Prescription History ({prescriptions.length})
        </button>
      </div>

      {/* --- TAB CONTENT: BOOK CONSULTATION --- */}
      {activeTab === 'book' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Doctors Listing */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-panel p-6 rounded-2xl flex items-center space-x-3">
              <Search className="h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search specialists by name or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-slate-100 placeholder-slate-550 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map((doc) => {
                const initials = doc.full_name.split(' ').map(n => n[0]).join('').substring(0, 2);
                return (
                  <div
                    key={doc.id}
                    onClick={() => dispatch(selectDoctor(doc.id))}
                    className={`p-5 rounded-2xl border cursor-pointer flex items-start space-x-4 transition-all duration-200 ${
                      selectedDoctorId === doc.id
                        ? 'bg-primary-600/10 border-primary-500 shadow-md shadow-primary-950/20'
                        : 'glass-panel border-slate-800 hover:border-slate-700/80 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="bg-primary-600/20 text-primary-400 font-bold border border-primary-500/20 rounded-2xl h-12 w-12 flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-white font-bold text-base">{doc.full_name}</h3>
                      <span className="inline-block bg-primary-950/40 text-primary-400 text-[10px] font-bold uppercase tracking-wider rounded-lg px-2 py-0.5 mt-1 border border-primary-500/15">
                        {doc.doctor_profile?.specialization}
                      </span>
                      <p className="text-xs text-slate-400 mt-2.5">
                        Experience: <strong className="text-slate-200 font-semibold">{doc.doctor_profile?.experience_years} Years</strong>
                      </p>
                    </div>
                  </div>
                );
              })}

              {filteredDoctors.length === 0 && (
                <p className="text-sm text-slate-500 col-span-2 py-10 text-center">No specialists found.</p>
              )}
            </div>
          </div>

          {/* Slots Selector & Reasons */}
          <div className="lg:col-span-4">
            {selectedDoctorId ? (
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Select Availability Slot</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Pick an available hour from the planner</p>
                </div>

                {docLoading ? (
                  <p className="text-sm text-slate-400">Loading open slots...</p>
                ) : selectedDoctorSchedule.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {selectedDoctorSchedule.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-sm font-semibold transition-all duration-150 ${
                          selectedSlot?.id === slot.id
                            ? 'bg-primary-600 border-primary-500 text-white shadow-md'
                            : 'bg-slate-950/40 border-slate-850 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="flex items-center space-x-1.5 text-xs">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <span>{slot.day}</span>
                        </span>
                        <span className="flex items-center space-x-1.5 text-xs">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span>{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-rose-500/5 border border-rose-500/15 text-rose-400 p-4 rounded-2xl text-xs flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>No active slots found. This doctor hasn't posted availability.</span>
                  </div>
                )}

                {/* Form parameters */}
                {selectedSlot && (
                  <form onSubmit={handleBook} className="space-y-4 pt-4 border-t border-slate-800/80">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Stated Reason for Visit</label>
                      <textarea
                        placeholder="Provide details about symptoms, consultation reason, etc."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="custom-input h-20 resize-none pt-3 text-sm"
                        required
                      />
                    </div>

                    {apptError && (
                      <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                        {apptError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={apptLoading}
                      className="w-full flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl py-3.5 transition-all shadow-md"
                    >
                      <CalendarCheck className="h-4.5 w-4.5" />
                      <span>{apptLoading ? 'Reserving...' : 'Confirm Reservation'}</span>
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="glass-panel p-8 rounded-3xl text-center text-slate-400 flex flex-col items-center justify-center border border-slate-850">
                <BookOpen className="h-10 w-10 text-slate-700 mb-3" />
                <p className="font-bold text-slate-300 text-sm">Select a Specialist</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Browse lists on the left and select a medical provider to inspect open hours.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- TAB CONTENT: MY APPOINTMENTS --- */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.map((appt) => (
              <div key={appt.id} className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex flex-col justify-between hover:border-slate-700/60 transition-all duration-200">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold text-lg">Dr. {appt.doctor?.user.full_name}</h3>
                      <p className="text-xs text-primary-400 capitalize mt-0.5">{appt.doctor?.specialization}</p>
                    </div>
                    {getStatusBadge(appt.status)}
                  </div>

                  <div className="space-y-2 text-sm text-slate-300 pt-3 border-t border-slate-900">
                    <div className="flex items-center space-x-2 text-xs">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>{appt.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span>{appt.time.substring(0, 5)}</span>
                    </div>
                    {appt.reason && (
                      <div className="mt-4 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-900/60 text-xs">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Reason</p>
                        <p className="text-slate-300 mt-1 leading-relaxed">{appt.reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {appt.status.toLowerCase() === 'completed' && (
                  <div className="mt-6 pt-4 border-t border-slate-900 flex justify-end">
                    {appt.prescription ? (
                      <button
                        onClick={() => setSelectedPrescription(appt.prescription)}
                        className="flex items-center space-x-1 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-xl px-4 py-2 text-xs font-bold transition-all"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>View Prescription</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 font-semibold italic">Medical Slip Pending</span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {appointments.length === 0 && (
              <div className="col-span-2 py-16 text-center text-slate-400 glass-panel rounded-3xl border border-slate-850">
                <Calendar className="h-12 w-12 text-slate-800 mx-auto mb-3" />
                <p className="font-bold text-slate-300">No scheduled sessions</p>
                <p className="text-xs text-slate-500 mt-1">Booked consultation hours will be tracked here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: PRESCRIPTION HISTORY --- */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {prescriptions.map((presc) => {
              const relatedAppt = appointments.find(a => a.id === presc.appointment_id);
              return (
                <div key={presc.id} className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                      <div>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Clinical Slip</span>
                        <h4 className="text-white font-bold text-base mt-1.5">Diagnosis: {presc.diagnosis}</h4>
                      </div>
                      {relatedAppt && (
                        <div className="text-right text-xs text-slate-400">
                          <p className="font-bold text-slate-200">Dr. {relatedAppt.doctor?.user.full_name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{relatedAppt.date}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                      <strong className="text-slate-500">Medicines:</strong> {presc.medicines}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-900 flex justify-end">
                    <button
                      onClick={() => setSelectedPrescription(presc)}
                      className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl px-4 py-2 text-xs font-semibold transition-all"
                    >
                      <FileHeart className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Open Medical Slip</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {prescriptions.length === 0 && (
              <div className="col-span-2 py-16 text-center text-slate-400 glass-panel rounded-3xl border border-slate-850">
                <FileText className="h-12 w-12 text-slate-800 mx-auto mb-3" />
                <p className="font-bold text-slate-300">No prescriptions logged</p>
                <p className="text-xs text-slate-500 mt-1">Medical prescription slips will appear here after a completed session.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- CLINICAL PRESCRIPTION DETAIL MODAL (HIGH FIDELITY RX SHEET) --- */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="prescription-slip w-full max-w-lg rounded-3xl p-8 relative border border-slate-300 font-sans shadow-2xl animate-fade-in-up">
            
            {/* Stamp Logo / Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-300 pb-5 mb-6">
              <div className="flex items-center space-x-3">
                <HeartPulse className="h-10 w-10 text-rose-600" />
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 tracking-tight uppercase">CareFlow Clinic</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center">
                    <MapPin className="h-3 w-3 mr-0.5 text-slate-400" />
                    Medical Center, Suite 404
                  </p>
                </div>
              </div>
              <div className="text-right text-[10px] font-bold text-slate-500 uppercase leading-normal tracking-wide">
                <p>Digital Prescription Ledger</p>
                <p className="text-slate-400">Rx ID: #{selectedPrescription.id}</p>
              </div>
            </div>

            {/* Slip metadata */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 mb-6 bg-slate-100/60 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Patient Name</p>
                <p className="text-slate-950 font-bold mt-0.5">Bob Patient</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase">Date Issued</p>
                <p className="text-slate-950 font-bold mt-0.5">
                  {appointments.find(a => a.id === selectedPrescription.appointment_id)?.date || 'N/A'}
                </p>
              </div>
            </div>

            {/* RX Body */}
            <div className="space-y-5 text-sm">
              <div className="border-b border-slate-200 pb-4">
                <h4 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">Clinical Diagnosis</h4>
                <p className="text-slate-900 font-extrabold text-lg mt-1">{selectedPrescription.diagnosis}</p>
              </div>

              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-1 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-rose-600 font-black text-sm">Rx</span>
                  <span>Prescribed Treatment / Medicines</span>
                </div>
                <p className="text-slate-800 mt-2 font-medium whitespace-pre-line leading-relaxed text-sm">
                  {selectedPrescription.medicines}
                </p>
              </div>

              {selectedPrescription.notes && (
                <div>
                  <h4 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">Doctor Notes &amp; Guidance</h4>
                  <p className="text-slate-700 mt-1.5 text-xs leading-relaxed italic">
                    {selectedPrescription.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Clinic stamp/signoff */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 tracking-wide">
                <Printer className="h-4.5 w-4.5" />
                <span>Digitally Verified Medical Document</span>
              </div>
              
              <button
                onClick={() => setSelectedPrescription(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl px-5 py-2.5 transition-all shadow-md"
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
