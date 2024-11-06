const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    ipcRenderer: {
      invoke: (channel, ...args) => {
        const validChannels = ['get-lab-id', 'set-lab-id'];
        if (validChannels.includes(channel)) {
          return ipcRenderer.invoke(channel, ...args);
        }
        return Promise.reject(new Error('Invalid channel'));
      }
    }
  }
);