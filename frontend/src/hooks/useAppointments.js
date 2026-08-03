import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchMyAppointments, 
  bookAppointment, 
  updateAppointmentStatus, 
  addPrescription,
  clearAppointmentMessages
} from '../store/appointmentSlice';

export const useAppointments = () => {
  const dispatch = useDispatch();
  const appointmentState = useSelector((state) => state.appointment);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Auto-fetch on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyAppointments());
    }
  }, [isAuthenticated, dispatch]);

  const book = async (appointmentData) => {
    const resultAction = await dispatch(bookAppointment(appointmentData));
    return bookAppointment.fulfilled.match(resultAction);
  };

  const updateStatus = async (appointmentId, status) => {
    const resultAction = await dispatch(updateAppointmentStatus({ appointmentId, status }));
    return updateAppointmentStatus.fulfilled.match(resultAction);
  };

  const prescribe = async (appointmentId, diagnosis, medicines, notes) => {
    const resultAction = await dispatch(addPrescription({ appointmentId, diagnosis, medicines, notes }));
    return addPrescription.fulfilled.match(resultAction);
  };

  const clearMessages = () => {
    dispatch(clearAppointmentMessages());
  };

  const refresh = () => {
    dispatch(fetchMyAppointments());
  };

  return {
    ...appointmentState,
    book,
    updateStatus,
    prescribe,
    clearMessages,
    refresh,
  };
};

export default useAppointments;
