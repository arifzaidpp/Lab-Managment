import { app, BrowserWindow, globalShortcut, screen } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';

let mainWindow;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width,
    height,
    fullscreen: true,
    alwaysOnTop: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../dist/index.html')}`
  );

  // Prevent window closing
  mainWindow.on('close', (e) => {
    e.preventDefault();
  });

  // Disable Alt+F4
  mainWindow.on('before-quit', (e) => {
    e.preventDefault();
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
    'CommandOrControl+Tab'
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