import axios, { AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useApi = () => {
  const makeRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api(config);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
      }
      throw new Error(error.response?.data?.message || 'An error occurred');
    }
  };

  return {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
      makeRequest<T>({ ...config, method: 'GET', url }),
    post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
      makeRequest<T>({ ...config, method: 'POST', url, data }),
    put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
      makeRequest<T>({ ...config, method: 'PUT', url, data }),
    delete: <T>(url: string, config?: AxiosRequestConfig) =>
      makeRequest<T>({ ...config, method: 'DELETE', url }),
  };
};