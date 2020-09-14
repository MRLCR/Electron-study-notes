const { app, BrowserWindow, ipcMain, Notification } = require('electron');

let mainWindow = null;

function createWindow(url = './src/index.html') {
  const win = new BrowserWindow({
    width: 600,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile(url);

  return win;
}

function handleIPC() {
  ipcMain.handle('notification', (e, {
    title,
    body,
    actions,
    closeButtonText,
  } = {}) => new Promise((resolve, reject) => {
    const notification = new Notification({
      title,
      body,
      actions,
      closeButtonText,
    });

    notification.show();

    notification.on('action', () => resolve({ event: 'action' }));
    notification.on('close', () => resolve({ event: 'close' }));

  }))
}

app.whenReady()
  .then(() => {
    mainWindow = createWindow();
    handleIPC();
  });
