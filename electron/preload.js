const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'electron',
  {
    ipcRenderer: {
      invoke: (channel, ...args) => {
        const validChannels = ['get-lab-id', 'set-lab-id', 'minimize-app', 'maximize-app'];
        if (validChannels.includes(channel)) {
          return ipcRenderer.invoke(channel, ...args);
        }
        return Promise.reject(new Error('Invalid channel'));
      }
    },
    os: {
      platform: process.platform
    }
  }
);