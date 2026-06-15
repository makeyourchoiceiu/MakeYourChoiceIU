import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StudentProfile } from '@/shared/types/user';
import { fetchStudentProfile } from '@/features/profile/services/profileService';

interface ProfileState {
  student: StudentProfile | null;
  loading: boolean;
  error: string | null;
  isStale: boolean;

  // Actions
  loadProfile: (forceRefresh?: boolean) => Promise<void>;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  clearProfile: () => void;
  setStudent: (student: StudentProfile | null) => void; // For direct setting
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      student: null,
      loading: false,
      error: null,
      isStale: false,

      loadProfile: async (forceRefresh = false) => {
        // If we already have data and not forcing refresh, skip
        if (!forceRefresh && get().student) {
          return;
        }

        set({ loading: true, error: null });

        try {
          const freshData = await fetchStudentProfile();
          set({
            student: freshData,
            loading: false,
            isStale: false
          });
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to load profile';
          set({
            error: errorMsg,
            loading: false,
            // If we have stale data, mark it
            isStale: get().student !== null
          });
        }
      },

      updateProfile: (updates) => {
        const current = get().student;
        if (!current) return;
        set({
          student: { ...current, ...updates }
        });
      },

      clearProfile: () => {
        set({
          student: null,
          error: null,
          isStale: false
        });
      },

      setStudent: (student) => {
        set({ student });
      }
    }),
    {
      name: 'student-profile-storage', // Key in localStorage
      // Optional: Whitelist what gets persisted
      partialize: (state) => ({
        student: state.student,
        // Don't persist loading/error/isStale
      }),
    }
  )
);