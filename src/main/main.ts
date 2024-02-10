/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
// import log from 'electron-log';
import log from './log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import Runtime from './Runtime';
import LastStateManager from './nedb/LastStateManager';
import _ from 'lodash';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let win: BrowserWindow | null = null;

let syncFns: { [key: string]: (...args: unknown[]) => void } = {};
ipcMain.on('sync-fn', (event, { name, args }) => {
  event.returnValue = syncFns[name](...args);
});

let asyncFns: { [key: string]: (...args: unknown[]) => void } = {};
ipcMain.handle('async-fn', (event, { name, args }) => {
  return asyncFns[name](...args);
});

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if(Runtime.isProd) {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if(Runtime.isDev) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};


const getLastStateWindowSize = async () => {
  const lastStateWindowPos = await LastStateManager.get('windowPos');
  const lastStateWindowSize = await LastStateManager.get('windowSize');
  console.log('lastStateWindowPos =', lastStateWindowPos);
  console.log('lastStateWindowSize =', lastStateWindowSize);
}

const getScreenSize = () => {
  let rect = { x: -1, y: -1, height: -1, width: -1 };
  const _screen = screen.getDisplayMatching(rect);
  // console.log('rect =', rect);
  // console.log('_screen =', _screen);
  return {
    ..._screen.workArea
  }
}

const getWindowSize = async () => {

  // todo: if dev maxmize window
  // else if exist last state window size then use
  // else set to default size (width: 1024, height: 728)

  const {
    width: maxWidth,
    height: maxHeight
  } = getScreenSize();

  if(Runtime.isDev) {
    return {
      x: 0, y: 0,
      width: maxWidth,
      height: maxHeight
    }
  } else {
    return {
      x: 0, y: 0,
      width: 1024,
      height: 720
    }
  }
}

const createWindow = async () => {

  if(Runtime.isDev) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const { x, y, width, height } = await getWindowSize();
  win = new BrowserWindow({
    show: false,
    x, y, width, height,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  win.loadURL(resolveHtmlPath('index.html'));

  win.on('ready-to-show', () => {
    if(!win) {
      throw new Error('"mainWindow" is not defined');
    }
    if(process.env.START_MINIMIZED) {
      win.minimize();
    } else {
      win.show();
    }
  });

  win.on('move', _.debounce(() => {
    const { x, y } = win?.getBounds();
    // setWindowPos({ x, y });
    LastStateManager.set('windowPos', { x, y });
  }, 100));
  win.on('closed', () => {
    win = null;
  });

  const menuBuilder = new MenuBuilder(win);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  win.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if(process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if(win === null) createWindow();
    });
  })
  .catch(console.log);
