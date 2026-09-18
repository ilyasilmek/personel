const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function findIndexHtml() {
  const candidates = [
    path.join(__dirname, 'dist', 'index.html'),
    path.join(app.getAppPath(), 'dist', 'index.html'),
    path.join(__dirname, 'index.html'),
    path.join(process.resourcesPath || '', 'app', 'dist', 'index.html'),
    path.join(process.resourcesPath || '', 'app.asar', 'dist', 'index.html'),
  ];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch (e) {}
  }
  return null;
}

function createMenu(win) {
  const template = [
    {
      label: 'Dosya',
      submenu: [
        {
          label: 'Yenile (F5)',
          accelerator: 'F5',
          click: () => win.reload(),
        },
        {
          label: 'Önbelleksiz Yenile (Ctrl+F5)',
          accelerator: 'CmdOrCtrl+F5',
          click: () => win.webContents.reloadIgnoringCache(),
        },
        { type: 'separator' },
        {
          label: 'Çıkış',
          accelerator: 'Alt+F4',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Görünüm',
      submenu: [
        {
          label: 'Tam Ekran (F11)',
          accelerator: 'F11',
          click: () => win.setFullScreen(!win.isFullScreen()),
        },
        {
          label: 'Yakınlaştır (Ctrl +)',
          accelerator: 'CmdOrCtrl+Plus',
          role: 'zoomIn',
        },
        {
          label: 'Uzaklaştır (Ctrl -)',
          accelerator: 'CmdOrCtrl+-',
          role: 'zoomOut',
        },
        {
          label: 'Varsayılan Boyut (Ctrl 0)',
          accelerator: 'CmdOrCtrl+0',
          role: 'resetZoom',
        },
      ],
    },
    {
      label: 'Araçlar',
      submenu: [
        {
          label: 'Geliştirici Konsolunu Aç/Kapat (F12)',
          accelerator: 'F12',
          click: () => win.webContents.toggleDevTools(),
        },
      ],
    },
    {
      label: 'Yardım',
      submenu: [
        {
          label: 'TCDD Personel Yönetim Sistemi Hakkında',
          click: () => {
            dialog.showMessageBox(win, {
              type: 'info',
              title: 'Hakkında',
              message: 'TCDD Gebze Vagon Bakım Atölye Müdürlüğü',
              detail: 'Personel ve Özlük Bilgileri Yönetim Sistemi v1.0.0\nLocal-First ve Çevrimdışı Çalışma Desteği',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const iconCandidates = [
    path.join(__dirname, 'dist', 'pwa-192x192.png'),
    path.join(__dirname, 'public', 'pwa-192x192.png'),
  ];
  let iconPath;
  for (const candidate of iconCandidates) {
    if (fs.existsSync(candidate)) {
      iconPath = candidate;
      break;
    }
  }

  const win = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'TCDD Gebze Vagon Bakım Atölye Müdürlüğü - Personel Takip',
    autoHideMenuBar: false,
    backgroundColor: '#0b192c',
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  createMenu(win);

  const targetFile = findIndexHtml();
  if (targetFile) {
    win.loadFile(targetFile).catch((err) => {
      console.error('HTML dosyası yüklenirken hata:', err);
      win.loadURL('http://localhost:3000');
    });
  } else {
    console.warn('dist/index.html bulunamadı, localhost:3000 deneniyor...');
    win.loadURL('http://localhost:3000').catch((err) => {
      console.error('Localhost bağlantısı başarısız:', err);
    });
  }

  // Yükleme hatası olursa logla
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Sayfa yükleme hatası:', errorCode, errorDescription, validatedURL);
  });

  // F12 veya Ctrl+Shift+I ile konsol açma
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
