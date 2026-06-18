import { create } from "zustand";
import { Member, Transfer, Alert } from "./auth";

export type PageName =
  | "splash"
  | "login"
  | "signup"
  | "home"
  | "services"
  | "wallet"
  | "transfer"
  | "deposit"
  | "withdraw"
  | "exchange"
  | "qrscanner"
  | "notifications"
  | "settings"
  | "support"
  | "account";

interface AppState {
  // Navigation
  currentPage: PageName;
  previousPage: PageName | null;
  navigateTo: (page: PageName) => void;
  goBack: () => void;

  // Auth
  member: Member | null;
  setMember: (member: Member | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Data
  transfers: Transfer[];
  setTransfers: (transfers: Transfer[]) => void;
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;

  // UI
  toastMessage: string | null;
  showToast: (message: string) => void;
  hideToast: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentPage: "splash",
  previousPage: null,
  navigateTo: (page) =>
    set((state) => ({
      currentPage: page,
      previousPage: state.currentPage,
    })),
  goBack: () =>
    set((state) => ({
      currentPage: state.previousPage || "home",
      previousPage: null,
    })),

  // Auth
  member: null,
  setMember: (member) => set({ member, isAuthenticated: !!member }),
  isAuthenticated: false,
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Data
  transfers: [],
  setTransfers: (transfers) => set({ transfers }),
  alerts: [],
  setAlerts: (alerts) => {
    const unread = alerts.filter((a) => !a.is_seen).length;
    set({ alerts, unreadCount: unread });
  },
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),

  // UI
  toastMessage: null,
  showToast: (message) => {
    set({ toastMessage: message });
    setTimeout(() => {
      set({ toastMessage: null });
    }, 3000);
  },
  hideToast: () => set({ toastMessage: null }),
}));
