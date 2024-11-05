import { useCallback } from 'react';
import { useApi } from './useApi';
import { useSessionStore } from '../store/sessions';

interface Session {
  id: string;
  userId: string;
  admissionNumber: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  compensation: number;
}

export const useSession = () => {
  const api = useApi();
  const { sessions, activeSession, startSession: setActiveSession, endSession: clearActiveSession } = useSessionStore();

  const getAllSessions = useCallback(async () => {
    try {
      const response = await api.get<Session[]>('/sessions');
      useSessionStore.setState({ sessions: response });
    } catch (error) {
      throw new Error('Failed to fetch sessions');
    }
  }, [api]);

  const startSession = useCallback(async () => {
    try {
      const response = await api.post<Session>('/sessions/start');
      setActiveSession(response);
    } catch (error) {
      throw new Error('Failed to start session');
    }
  }, [api, setActiveSession]);

  const endSession = useCallback(async () => {
    try {
      const response = await api.post<Session>('/sessions/end');
      clearActiveSession();
      return response;
    } catch (error) {
      throw new Error('Failed to end session');
    }
  }, [api, clearActiveSession]);

  return {
    sessions,
    activeSession,
    getAllSessions,
    startSession,
    endSession,
  };
};