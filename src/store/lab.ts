import { create } from 'zustand';

// Safe Electron require
const getElectronBridge = () => {
  try {
    if (window && 'electron' in window) {
      return (window as any).electron;
    }
    return null;
  } catch {
    return null;
  }
};

interface LabState {
  labId: string | null;
  isLabSet: boolean;
  setLabId: (id: string) => Promise<void>;
  initializeLab: () => Promise<void>;
}

export const useLabStore = create<LabState>((set) => ({
  labId: null,
  isLabSet: false,
  setLabId: async (id: string) => {
    const electron = getElectronBridge();
    if (electron?.ipcRenderer) {
      await electron.ipcRenderer.invoke('set-lab-id', id);
    }
    set({ labId: id, isLabSet: true });
  },
  initializeLab: async () => {
    const electron = getElectronBridge();
    let labId = null;
    
    if (electron?.ipcRenderer) {
      labId = await electron.ipcRenderer.invoke('get-lab-id');
    } else {
      // Fallback for development/web environment
      labId = localStorage.getItem('labId') || 'DEV-LAB';
      localStorage.setItem('labId', labId);
    }
    
    set({ labId, isLabSet: true });
  },
}));