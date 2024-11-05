import { create } from 'zustand';

interface Session {
  id: string;
  userId: string;
  admissionNumber: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  compensation: number;
}

interface SessionState {
  sessions: Session[];
  activeSession: Session | null;
  startSession: (session: Session) => void;
  endSession: () => void;
  setSessions: (sessions: Session[]) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  activeSession: null,
  startSession: (session: Session) => set({ activeSession: session }),
  endSession: () => set({ activeSession: null }),
  setSessions: (sessions: Session[]) => set({ sessions }),
}));