import { useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import { useSessionStore } from '../store/sessions';
import { useLabStore } from '../store/lab';

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

export const useSession = () => {
  const api = useApi();
  const labId = useLabStore((state) => state.labId);
  const { 
    sessions, 
    activeSession, 
    startSession: setActiveSession, 
    endSession: clearActiveSession,
    updateLastActivity 
  } = useSessionStore();

  const getAllSessions = useCallback(async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const response = await api.get<{
        sessions: Session[];
        totalPages: number;
        currentPage: number;
      }>('/sessions', { params });
      useSessionStore.setState({ sessions: response.sessions });
      return response;
    } catch (error) {
      throw new Error('Failed to fetch sessions');
    }
  }, [api]);

  const startSession = useCallback(async (purpose: string) => {
    try {
      const response = await api.post<Session>('/sessions/start', {
        purpose,
        labId
      });
      setActiveSession(response);
    } catch (error) {
      throw new Error('Failed to start session');
    }
  }, [api, labId, setActiveSession]);

  const endSession = useCallback(async () => {
    try {
      const response = await api.post<Session>('/sessions/end');
      clearActiveSession();
      return response;
    } catch (error) {
      throw new Error('Failed to end session');
    }
  }, [api, clearActiveSession]);

  const updateActivity = useCallback(async () => {
    try {
      await api.post('/sessions/activity');
      updateLastActivity();
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  }, [api, updateLastActivity]);

  // Set up activity tracking
  useEffect(() => {
    if (activeSession) {
      const interval = setInterval(updateActivity, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [activeSession, updateActivity]);

  return {
    sessions,
    activeSession,
    getAllSessions,
    startSession,
    endSession,
    updateActivity,
  };
};