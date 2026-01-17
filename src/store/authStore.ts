import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, Teacher } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      teacher: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (token: string, teacher: Teacher) => {
        set({
          token,
          teacher,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      clearAuth: () => {
        set({
          token: null,
          teacher: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateTeacher: (teacherData: Partial<Teacher>) => {
        const currentTeacher = get().teacher;
        if (currentTeacher) {
          set({
            teacher: { ...currentTeacher, ...teacherData },
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        teacher: state.teacher,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setLoading(false);
        }
      },
    }
  )
);

export default useAuthStore;
