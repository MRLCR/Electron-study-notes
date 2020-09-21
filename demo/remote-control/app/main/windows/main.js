const path = require('path');
const { BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');

let win;
let willQuitApp = false;

function create() {
  win = new BrowserWindow({
    width: 600,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.on('close', e => {
    if (willQuitApp) {
      win = null;
    } else {
      e.preventDefault();
      win && win.hide();
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:8080');
  } else {
    // TODO:
    win.loadFile(path.resolve(__dirname, '../../renderer/pages/main/index.html'));
  }
}

function send(channel, ...args) {
  win && win.webContents.send(channel, ...args);
}

function show() {
  win && win.show();
}

function close() {
  willQuitApp = true;
  win && win.close();
}

function hide() {
  win && win.hide();
}

module.exports = {
  create,
  send,
  show,
  close,
  hide,
}
