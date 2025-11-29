import { create } from 'zustand';
import axios from 'axios';

const useAttendanceStore = create((set) => ({
  // State Variables
  user: JSON.parse(localStorage.getItem('user')) || null,
  stats: {},
  history: [],
  allAttendance: [],
  loading: false,

  // Actions
  setUser: (user) => set({ user }),
  
  // Fetch Manager Data (Charts & Lists)
  fetchManagerDashboard: async () => {
    set({ loading: true });
    try {
      const statsRes = await axios.get('http://localhost:5000/api/dashboard/manager');
      const allRes = await axios.get('http://localhost:5000/api/attendance/all');
      set({ stats: statsRes.data, allAttendance: allRes.data, loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  // Fetch Employee Data
  fetchEmployeeDashboard: async (id) => {
    set({ loading: true });
    try {
      const histRes = await axios.get(`http://localhost:5000/api/attendance/my-history/${id}`);
      set({ history: histRes.data, loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  }
}));

export default useAttendanceStore;