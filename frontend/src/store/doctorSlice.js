import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchDoctors = createAsyncThunk(
  'doctor/fetchDoctors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/doctors/`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch doctors');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDoctorSchedule = createAsyncThunk(
  'doctor/fetchDoctorSchedule',
  async ({ doctorId, onlyAvailable = true }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/doctors/${doctorId}/schedule?only_available=${onlyAvailable}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch doctor schedule');
      }
      const data = await response.json();
      return { doctorId, schedule: data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  doctors: [],
  selectedDoctorId: null,
  selectedDoctorSchedule: [],
  loading: false,
  error: null,
};

const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    selectDoctor: (state, action) => {
      state.selectedDoctorId = action.payload;
      state.selectedDoctorSchedule = [];
    },
    clearDoctorSelection: (state) => {
      state.selectedDoctorId = null;
      state.selectedDoctorSchedule = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Doctor Schedule
      .addCase(fetchDoctorSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDoctorSchedule = action.payload.schedule;
      })
      .addCase(fetchDoctorSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { selectDoctor, clearDoctorSelection } = doctorSlice.actions;
export default doctorSlice.reducer;
