import { create } from 'zustand';
import { supabase } from './supabase';
import type { Member } from './types';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin: Member | null;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  admin: null,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;

      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('auth_uid', authData.user.id)
        .single();

      if (memberError || !memberData) throw new Error('بيانات العضو غير موجودة');

      if (!memberData.is_manager) {
        await supabase.auth.signOut();
        throw new Error('ليس لديك صلاحية الوصول');
      }

      set({ isAuthenticated: true, admin: memberData, isLoading: false });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ في تسجيل الدخول';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    supabase.auth.signOut();
    set({ isAuthenticated: false, admin: null });
  },

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        set({ isLoading: false });
        return;
      }

      const { data: memberData } = await supabase
        .from('members')
        .select('*')
        .eq('auth_uid', session.user.id)
        .single();

      if (memberData && memberData.is_manager) {
        set({ isAuthenticated: true, admin: memberData, isLoading: false });
      } else {
        await supabase.auth.signOut();
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));