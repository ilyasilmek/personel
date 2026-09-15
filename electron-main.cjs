const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 850,
    title: 'TCDD Personel Yönetim Sistemi',
    autoHideMenuBar: true,
    backgroundColor: '#f0ede1',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  const distPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(distPath)) {
    win.loadFile(distPath).catch((err) => {
      console.error('Failed to load file:', err);
      win.loadURL('http://localhost:3000');
    });
  } else {
    win.loadURL('http://localhost:3000');
  }

  // F12 veya Ctrl+Shift+I ile gelistirici konsolunu acma
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      win.webContents.toggleDevTools();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
