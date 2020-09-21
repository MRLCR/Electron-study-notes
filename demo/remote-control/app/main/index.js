const {app} = require('electron');
const mainWin = require('./windows/main');

const gotTheLock = app.requestSingleInstanceLock(); // 单例锁

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    mainWin.show();
  });

  app.on('ready', () => {
    mainWin.create();
  });

  app.on('before-quit', () => {
    mainWin.close();
  });

  app.on('activate', () => {
    mainWin.show();
  });
}
