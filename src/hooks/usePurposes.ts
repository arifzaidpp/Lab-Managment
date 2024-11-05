import { useEffect, useState } from 'react';
import { useApi } from './useApi';

interface Purpose {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export const usePurposes = () => {
  const api = useApi();
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPurposes = async () => {
    try {
      const response = await api.get<Purpose[]>('/purposes');
      setPurposes(response.filter(p => p.active));
    } catch (error) {
      console.error('Failed to fetch purposes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPurpose = async (name: string, description: string) => {
    try {
      const response = await api.post<Purpose>('/purposes', { name, description });
      setPurposes(prev => [...prev, response]);
      return response;
    } catch (error) {
      throw new Error('Failed to create purpose');
    }
  };

  const updatePurpose = async (id: string, data: Partial<Purpose>) => {
    try {
      const response = await api.put<Purpose>(`/purposes/${id}`, data);
      setPurposes(prev => prev.map(p => p.id === id ? response : p));
      return response;
    } catch (error) {
      throw new Error('Failed to update purpose');
    }
  };

  const deletePurpose = async (id: string) => {
    try {
      await api.delete(`/purposes/${id}`);
      setPurposes(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      throw new Error('Failed to delete purpose');
    }
  };

  useEffect(() => {
    fetchPurposes();
  }, []);

  return {
    purposes,
    isLoading,
    createPurpose,
    updatePurpose,
    deletePurpose,
    refreshPurposes: fetchPurposes,
  };
};