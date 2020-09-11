const {app, BrowserWindow, ipcMain, Notification} = require('electron');

let MAIN_WIN = null;

function createWindow(url = './index.html') {
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

    notification.on('action', () => {
      resolve({
        event: 'action',
      });
    });

    notification.on('close', () => {
      resolve({
        event: 'close',
      });
    });
  }))
}

app.whenReady().then(() => {
  MAIN_WIN = createWindow(); // 防止主窗口被垃圾回收
  handleIPC();
});
