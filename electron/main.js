import { app, BrowserWindow, globalShortcut, screen, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';
import Store from 'electron-store';
import pkg from 'node-machine-id';
const { machineId } = pkg;

const store = new Store();
let mainWindow;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getOrCreateLabId() {
  let labId = store.get('labId');
  if (!labId) {
    const id = await machineId();
    labId = `LAB-${id.substring(0, 8)}`;
    store.set('labId', labId);
  }
  return labId;
}

async function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width,
    height,
    fullscreen: true,
    alwaysOnTop: true,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  await getOrCreateLabId();
  
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../dist/index.html')}`
  );

  // Prevent window closing
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.focus();
    }
  });

  // Handle app quit
  app.on('before-quit', () => {
    app.isQuitting = true;
  });

  // Disable Alt+F4
  mainWindow.on('before-quit', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.focus();
    }
  });

  // Block all keyboard shortcuts that could bypass the application
  const shortcuts = [
    'Alt+Tab',
  ];

  shortcuts.forEach(shortcut => {
    globalShortcut.register(shortcut, () => {
      mainWindow.focus();
      return false;
    });
  });

  // Keep window always on top and visible
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.setSkipTaskbar(true);
  mainWindow.setKiosk(true);
  mainWindow.setContentProtection(true);
  
  // Handle window blur
  mainWindow.on('blur', () => {
    if (!app.isQuitting) {
      mainWindow.focus();
    }
  });

  // Handle minimize attempts
  mainWindow.on('minimize', (e) => {
    e.preventDefault();
    mainWindow.restore();
    mainWindow.focus();
  });

  // Handle maximize attempts
  mainWindow.on('maximize', (e) => {
    e.preventDefault();
    mainWindow.focus();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Clean up shortcuts on quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC handlers
ipcMain.handle('get-lab-id', async () => {
  return await getOrCreateLabId();
});

ipcMain.handle('set-lab-id', async (_, newLabId) => {
  store.set('labId', newLabId);
  return newLabId;
});