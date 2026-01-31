import {
  Menu,
  MenuItemConstructorOptions,
} from 'electron';
import { isMacintosh, isWindows } from './util/platform';
import { mainWindow } from './main';
import {
  appPreferencesMenuId, appQuitMenuId,
  filePreferencesMenuId,
  editUndoMenuId, editRedoMenuId, editCutMenuId, editCopyMenuId, editPasteMenuId, editSelectAllMenuId,
} from '../common/Types';
import { keyBinding } from '../common/globals';

// { id: [Win, Mac] }
const keyBindingIdx = isWindows ? 0 : 1;

export class Menubar {
  template: MenuItemConstructorOptions[];

  install(): void {
    const template: MenuItemConstructorOptions[] = this.template = [];

    if(isMacintosh) {
      // set application menu
      this.addApplicationMenu(template);
    }

    this.addFileMenu(template);
    this.addEditMenu(template);
    this.addViewMenu(template);
    this.addWindowMenu(template);
    this.addHelpMenu(template);

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  getTemplate(): MenuItemConstructorOptions[] { return this.template; }

  addApplicationMenu(options: MenuItemConstructorOptions[]) {
    options.push({
      id: 'application',
      label: 'yourappname',
      submenu: [
        {
          label: 'About yourappname',
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'Command+,',
          click: null, // mainWindow.preferenceClickHandler.bind(mainWindow),
        },
        { type: 'separator' },
        {
          label: 'Hide yourappname',
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

    if(isWindows) {
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
      submenu: [],
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