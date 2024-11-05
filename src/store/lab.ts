import { create } from 'zustand';
const { ipcRenderer } = window.require('electron');

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
    await ipcRenderer.invoke('set-lab-id', id);
    set({ labId: id, isLabSet: true });
  },
  initializeLab: async () => {
    const labId = await ipcRenderer.invoke('get-lab-id');
    set({ labId, isLabSet: true });
  },
}));