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
import os from 'os';
import { app, BrowserWindow, shell, ipcMain, screen, session } from 'electron';
import { autoUpdater } from 'electron-updater';
// import log from 'electron-log';
import log from './log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import Runtime from './Runtime';
import LastStateManager from './nedb/LastStateManager';
import _ from 'lodash';
import {v4 as uuidv4} from 'uuid';
import TerminalLocal from './terminal/TerminalLocal';
import { getAppDb } from './data';
import { ConfigsType, configs } from '../common/configs';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

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

const installIpc = () => {

  ipcMain.handle('config all', async (event, args: any[]) => {
    let cfgs = await cfgdb.dict.cfg.all();
    return Object.assign({}, configs, cfgs);
  });
  ipcMain.handle('config get', async (event, args: any[]) => {
    let key = args[0] as keyof ConfigsType;
    return await cfgdb.dict.cfg.get(key, configs[key]);
  });
  ipcMain.on('config set', async (event, args: any[]) => {
    let key = args[0];
    let value = args[1];
    console.log(`config set [${key}]: ${value}`);
    await cfgdb.dict.cfg.set(key, value);
  });
  ipcMain.on('config update', async (event, args: any[]) => {
    const old_configs = await cfgdb.dict.cfg.all();
    let data = args[0];
    await cfgdb.dict.cfg.update(data);
  });

  const terminals = new Map<string, TerminalLocal>();

  ipcMain.on('new', (event, args: any[]) => {
    // console.log('[main.ts/new] args =', args);
    const arg = args[0];
    if(arg.type === 'local') {
      const terminal = new TerminalLocal({uid: arg.uid});
      terminal.on('data', (data: string) => {
        // console.log('data event is called..., data =', data);
        win?.webContents.send('terminal data', data);
      });
      terminal.start();
      terminals.set(arg.uid, terminal);
    } else if(arg.type === 'ssh') {
    }
  });

  ipcMain.on('data', (event, args: any[]) => {
    // console.log('[main.ts/data] args =', args);
    const arg = args[0];
    const terminal = arg && arg.uid && terminals.get(arg.uid);
    if(terminal) {
      terminal.write(arg.data);
    }
  });
}

let win: BrowserWindow | null = null;

const createWindow = async () => {

  await getAppDb();

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
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    show: false,
    x, y, width, height,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  installIpc();

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
    const { x, y } = win!.getBounds();
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

import installExtension, {
  REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS
} from 'electron-devtools-installer';

app
  .whenReady()
  .then(
    () => {
    [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS].map(
      (e) => installExtension(e)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err))
    )}
  )
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if(win === null) createWindow();
    });
  })
  .catch(console.log);
