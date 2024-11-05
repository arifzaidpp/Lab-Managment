import { create } from 'zustand';

interface Session {
  id: string;
  userId: string;
  admissionNumber: string;
  labId: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  compensation: number;
  purpose: string;
  lastActivityTime: string;
}

interface SessionState {
  sessions: Session[];
  activeSession: Session | null;
  startSession: (session: Session) => void;
  endSession: () => void;
  setSessions: (sessions: Session[]) => void;
  updateLastActivity: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  activeSession: null,
  startSession: (session: Session) => set({ activeSession: session }),
  endSession: () => set({ activeSession: null }),
  setSessions: (sessions: Session[]) => set({ sessions }),
  updateLastActivity: () => set((state) => ({
    activeSession: state.activeSession
      ? { ...state.activeSession, lastActivityTime: new Date().toISOString() }
      : null
  })),
}));