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
import { app, BrowserWindow, shell, screen, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { TerminalItem } from '../common/Types';
import TerminalLocal from './terminal/TerminalLocal';
import TerminalSsh from './terminal/TerminalSsh';
import TerminalBase from './terminal/TerminalBase';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

class MainWindow {
  browserWindow: BrowserWindow | null = null;
  isDebug: boolean = false;

  constructor() {
    if(process.env.NODE_ENV === 'production') {
      const sourceMapSupport = require('source-map-support');
      sourceMapSupport.install();
    }

    this.isDebug =
      process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

    if(this.isDebug) {
      require('electron-debug')();
    }
  }

  installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    return installer
      .default(
        extensions.map((name) => installer[name]),
        forceDownload,
      )
      .catch(console.log);
  };

  getMaxScreenSize = () => {
    let rect = { x: -1, y: -1, height: -1, width: -1 };
    const _screen = screen.getDisplayMatching(rect);
    return {
      ..._screen.workArea
    }
  }

  getWindowSize = () => {

    // todo: if dev maxmize window
    // else if exist last state window size then use
    // else set to default size (width: 1024, height: 728)

    const {
      width: maxWidth,
      height: maxHeight
    } = this.getMaxScreenSize();

    return {
      x: 0, y: 0,
      width: maxWidth,
      height: maxHeight
    }
  }

  installIpc = () => {
    const self = this;

    const terminals = new Map<string, TerminalBase>();

    ipcMain.on('new', (event, args: any[]) => {
      // console.log('[main.ts/new] args =', args);
      const arg: TerminalItem = args[0] as TerminalItem;
      if(arg.type === 'local') {
        const terminal = new TerminalLocal(arg);
        terminal.on('data', (data: string) => {
          // console.log('data event is called..., data =', data);
          this.browserWindow?.webContents.send('terminal data', data);
        });
        terminal.start();
        terminals.set(arg.uid, terminal);
      } else if(arg.type === 'remote') {
        const terminal = new TerminalSsh(arg);
        terminal.on('data', (data: string) => {
          // console.log('data event is called..., data =', data);
          this.browserWindow?.webContents.send('terminal data', data);
        });
        terminal.start();
        terminals.set(arg.uid, terminal);
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

  createWindow = async () => {
    if(this.isDebug) {
      await this.installExtensions();
    }

    const RESOURCES_PATH = app.isPackaged
      ? path.join(process.resourcesPath, 'assets')
      : path.join(__dirname, '../../assets');

    const getAssetPath = (...paths: string[]): string => {
      return path.join(RESOURCES_PATH, ...paths);
    };

    const { x, y, width, height } = this.getWindowSize();

    this.browserWindow = new BrowserWindow({
      // show: false,
      // width: 1024, height: 728,
      titleBarStyle: 'hidden',
      x, y, width, height,
      icon: getAssetPath('icon.png'),
      webPreferences: {
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
    });

    this.browserWindow.loadURL(resolveHtmlPath('index.html'));

    this.installIpc();

    this.browserWindow.on('ready-to-show', () => {
      if(!this.browserWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      if(process.env.START_MINIMIZED) {
        this.browserWindow.minimize();
      } else {
        this.browserWindow.show();
      }
    });

    this.browserWindow.on('closed', () => {
      this.browserWindow = null;
    });

    const menuBuilder = new MenuBuilder(this.browserWindow);
    menuBuilder.buildMenu();

    // Open urls in the user's browser
    this.browserWindow.webContents.setWindowOpenHandler((edata) => {
      shell.openExternal(edata.url);
      return { action: 'deny' };
    });

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater();
  };
}


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

export const mainWindow = new MainWindow();

app
  .whenReady()
  .then(() => {
    mainWindow.createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      // TODO: if(mainWindow === null) mainWindow.createWindow();
    });
  })
  .catch(console.log);
