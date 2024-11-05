import { app, BrowserWindow, globalShortcut, screen, ipcMain } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import Store from 'electron-store';
import { machineId } from 'node-machine-id';

const store = new Store();
let mainWindow;

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
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // Get or create lab ID before loading the app
  const labId = await getOrCreateLabId();
  
  // Pass lab ID to renderer process
  global.labId = labId;

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

  // Prevent task switching and other system shortcuts
  const shortcuts = [
    'Alt+Tab',
    'Alt+F4',
    'CommandOrControl+Q',
    'Super+D',
    'CommandOrControl+M',
    'F11',
    'Alt+Space',
    'CommandOrControl+Shift+Esc',
    'Alt+Esc',
    'CommandOrControl+Tab',
    'Win+D',
    'Win+M',
    'Win+Tab'
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

  // Prevent display sleep
  mainWindow.setContentProtection(true);
  
  // Handle window blur
  mainWindow.on('blur', () => {
    if (!app.isQuitting) {
      mainWindow.focus();
    }
  });

  // IPC handlers
  ipcMain.handle('get-lab-id', async () => {
    return await getOrCreateLabId();
  });

  ipcMain.handle('set-lab-id', async (event, newLabId) => {
    store.set('labId', newLabId);
    return newLabId;
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