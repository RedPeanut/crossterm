import {
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
} from 'electron';
// import { isMacintosh, isWindows } from './util/platform';
import { mainWindow } from './main';
import {
  appPreferencesMenuId, appSettingsMenuId, appShortcutsMenuId, appQuitMenuId,
  filePreferencesMenuId, fileDisconnMenuId, fileReconnMenuId, fileReconnAllMenuId,
  editUndoMenuId, editRedoMenuId, editCutMenuId, editCopyMenuId, editPasteMenuId, editSelectAllMenuId,
  tabAlignMenuId, tabAlignVerticalMenuId, tabAlignHorizontalMenuId, tabAlignTilesMenuId,
} from '../common/Types';
import { keyBinding } from '../common/globals';

// { id: [Win, Mac] }
const keyBindingIdx = process.platform === 'win32' ? 0 : 1;

export class Menubar {
  template: MenuItemConstructorOptions[];

  constructor(mainWindow: BrowserWindow) {
  }

  install(): void {
    const template: MenuItemConstructorOptions[] = this.template = [];

    if (process.platform === 'darwin') {
      // set application menu
      this.addApplicationMenu(template);
    }

    this.addFileMenu(template);
    this.addEditMenu(template);
    this.addViewMenu(template);
    this.addTabMenu(template);
    this.addWindowMenu(template);
    this.addHelpMenu(template);

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  getTemplate(): MenuItemConstructorOptions[] { return this.template; }

  addApplicationMenu(options: MenuItemConstructorOptions[]) {
    options.push({
      id: 'application',
      label: 'crossterm',
      submenu: [
        {
          label: 'About crossterm',
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: null, // keyBinding[appPreferencesMenuId][keyBindingIdx], // 'Command+,',
          click: null, // mainWindow.preferenceClickHandler.bind(mainWindow),
          submenu: [
            {
              label: 'Settings',
              accelerator: keyBinding[appSettingsMenuId][keyBindingIdx],
              click: (item, focusedWindow) => {}
            },
            {
              label: `Keyboard Shortcuts [⌘K ⌘S]`,
              accelerator: keyBinding[appShortcutsMenuId][keyBindingIdx],
              click: (item, focusedWindow) => {}
            },
          ]
        },
        { type: 'separator' },
        {
          label: 'Hide crossterm',
          accelerator: 'Command+H',
          // selector: 'hide:',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          // selector: 'hideOtherApplications:',
          role: 'hideOthers'
        },
        /* { label: 'Show All',
          // selector: 'unhideAllApplications:'
          role: 'unhide'
        }, */
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          role: 'quit',
          /* click: () => {
            app.quit();
          }, */
        },
      ],
    });
  }

  addFileMenu(options: MenuItemConstructorOptions[]) {
    const fileSubmenu: MenuItemConstructorOptions[] = [];

    fileSubmenu.push();

    if (process.platform === 'win32') {
      fileSubmenu.push({ type: 'separator' as const });
      fileSubmenu.push({
        id: filePreferencesMenuId,
        label: 'Preferences...',
        accelerator: keyBinding[filePreferencesMenuId][keyBindingIdx],
        click: null, // mainWindow.preferenceClickHandler.bind(mainWindow),
      });

      options.push({
      label: '&File',
      submenu: fileSubmenu
    });
    }

    options.push({
      label: '&File',
      submenu: [
        {
          id: fileDisconnMenuId,
          label: '연결 끊기',
          accelerator: keyBinding[fileDisconnMenuId][keyBindingIdx],
          click: null
        },
        {
          id: fileReconnMenuId,
          label: '다시 연결',
          accelerator: keyBinding[fileReconnMenuId][keyBindingIdx],
          click: null
        },
        {
          id: fileReconnAllMenuId,
          label: '모두 다시 연결',
          accelerator: null, // keyBinding[fileReconnAllMenuId][keyBindingIdx],
          click: null
        },
      ],
    });
  }

  addEditMenu(options: MenuItemConstructorOptions[]) {
    options.push({
      label: '&Edit',
      submenu: [

        { id: editUndoMenuId, label: 'Undo', accelerator: keyBinding[editUndoMenuId][keyBindingIdx], role: 'undo' },
        { id: editRedoMenuId, label: 'Redo', accelerator: keyBinding[editRedoMenuId][keyBindingIdx], role: 'redo' },
        { type: 'separator' },
        { id: editCutMenuId, label: 'Cut', accelerator: keyBinding[editCutMenuId][keyBindingIdx], role: 'cut' },
        {
          id: editCopyMenuId,
          label: 'Copy', accelerator: keyBinding[editCopyMenuId][keyBindingIdx],
          role: 'copy',
          // click: () => { console.log('click event handler is called ..'); shell.beep(); },
        },
        {
          id: editPasteMenuId,
          label: 'Paste', accelerator: keyBinding[editPasteMenuId][keyBindingIdx],
          role: 'paste',
          // click: () => {},
        },
        { id: editSelectAllMenuId, label: 'Select All', accelerator: keyBinding[editSelectAllMenuId][keyBindingIdx], role: 'selectAll' },
      ],
    });
  }

  addViewMenu(options: MenuItemConstructorOptions[]) {
    options.push({
      label: '&View',
      submenu: [],
    });
  }

  addTabMenu(options: MenuItemConstructorOptions[]) {
    options.push({
      label: 'Ta&b',
      submenu: [
        {
          id: tabAlignMenuId,
          label: '정렬',
          accelerator: null, // keyBinding[tabAlignMenuId][keyBindingIdx],
          // click: () => {},
          submenu: [
            {
              id: tabAlignVerticalMenuId,
              label: '세로로 정렬',
              accelerator: null, // keyBinding[tabAlignVerticalMenuId][keyBindingIdx],
              // click: () => {},
            },
            {
              id: tabAlignHorizontalMenuId,
              label: '가로로 정렬',
              accelerator: null, // keyBinding[tabAlignHorizontalMenuId][keyBindingIdx],
              // click: () => {},
            },
            {
              id: tabAlignTilesMenuId,
              label: '바둑판식 정렬',
              accelerator: null, // keyBinding[tabAlignTilesMenuId][keyBindingIdx],
              // click: () => {},
            },
          ],
        },
      ],
    });
  }

  addWindowMenu(options: MenuItemConstructorOptions[]) {
    options.push({
      label: 'Window',
      submenu: [],
    });
  }

  addHelpMenu(options: MenuItemConstructorOptions[]) {
    options.push({
      label: '&Help',
      submenu: [],
    });
  }
}