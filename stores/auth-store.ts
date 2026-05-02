import { create } from "zustand";
import type { User } from "firebase/auth";

export interface AuthClaims {
  uid: string;
  email: string | null;
  displayName: string | null;
  billingPlan: string;
  billingStatus: string | null;
  billingCustomerId: string | null;
}

export type ProfileStatus = "idle" | "loading" | "ready" | "error";

interface AuthState {
  user: User | null;
  claims: AuthClaims | null;
  profileStatus: ProfileStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setClaims: (claims: AuthClaims | null) => void;
  setProfileStatus: (s: ProfileStatus) => void;
  setLoading: (v: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  claims: null,
  profileStatus: "idle",
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),
  setClaims: (claims) => set({ claims }),
  setProfileStatus: (profileStatus) => set({ profileStatus }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({
      user: null,
      claims: null,
      profileStatus: "idle",
      isLoading: false,
      isAuthenticated: false,
    }),
}));
