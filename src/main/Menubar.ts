import { localize } from '../common/nls';
import {
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
} from 'electron';
// import { isMacintosh, isWindows } from './util/platform';
// import { mainWindow } from './main';
import {
  // menu id
  appSettingsMenuId, appShortcutsMenuId,
  /*appPreferencesMenuId, appSettingsMenuId, appShortcutsMenuId, appQuitMenuId,
  filePreferencesMenuId, fileDisconnMenuId, fileReconnMenuId, fileReconnAllMenuId, fileImportMenuId, fileImportCmdId, fileExportMenuId, fileExportCmdId,
  editUndoMenuId, editRedoMenuId, editCutMenuId, editCopyMenuId, editPasteMenuId, editSelectAllMenuId,
  tabAlignMenuId, tabAlignVerticalMenuId, tabAlignHorizontalMenuId, tabAlignTilesMenuId,
  tabCloseAllMenuId, tabCloseOthersMenuId,
  tabToggleBroadcastInputMenuId,*/
  // command id
  appShortcutsCmdId,
  /*editCopyCmdId, editPasteCmdId,
  tabAlignVerticalCmdId, tabAlignHorizontalCmdId, tabAlignTilesCmdId,
  tabToggleBroadcastInputCmdId*/
  SerializableMenuItem,
} from '../common/Types';
import { keyBinding } from '../common/globals';

// { id: [Win, Mac] }
const keyBindingIdx = process.platform === 'win32' ? 0 : 1;

/**
 * 네이티브 메뉴바.
 *
 * 메뉴 구조는 renderer의 MenuRegistry가 정한다. renderer가 resolve 한 결과를 'menubar update'로 보내면
 * 여기서는 그걸 Electron 메뉴로 바꾸기만 한다. 클릭하면 'execute command'로 renderer의 커맨드를 실행한다.
 *
 * Note. mac의 application 메뉴(About, Hide, Quit 등 role 항목)만 main에서 직접 만든다.
 * Note. mac 외의 플랫폼은 네이티브 메뉴를 쓰지 않는다. (renderer의 UI 메뉴바만 사용)
 */
export class Menubar {
  // template: MenuItemConstructorOptions[];

  constructor(readonly mainWindow: BrowserWindow) {
  }

  /*install(): void {
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

    if (process.platform === 'darwin') {
      const menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menu);
    } else {
      Menu.setApplicationMenu(null);
    }
  }

  getTemplate(): MenuItemConstructorOptions[] { return this.template; }*/

  install(): void {
    // renderer가 메뉴를 보내기 전까지는 application 메뉴만 보인다.
    this.update([]);
  }

  update(menu: SerializableMenuItem[]): void {
    if (process.platform !== 'darwin') {
      Menu.setApplicationMenu(null);
      return;
    }

    const template: MenuItemConstructorOptions[] = [
      this.createApplicationMenu(),
      ...menu.map(item => this.toMenuItemOptions(item)),
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  private toMenuItemOptions(item: SerializableMenuItem): MenuItemConstructorOptions {
    if (item.type === 'separator') {
      return { type: 'separator' };
    }

    if (item.submenu) {
      return {
        label: item.label,
        enabled: item.enabled,
        submenu: item.submenu.map(submenuItem => this.toMenuItemOptions(submenuItem)),
      };
    }

    const commandId = item.commandId;
    return {
      label: item.label,
      type: item.type === 'checkbox' ? 'checkbox' : 'normal',
      checked: item.checked,
      enabled: item.enabled,
      accelerator: item.accelerator,
      click: commandId
        ? (menuItem, focusedWindow) => (focusedWindow ?? this.mainWindow).webContents.send('execute command', commandId)
        : undefined,
    };
  }

  createApplicationMenu(): MenuItemConstructorOptions {
    return {
      id: 'application',
      label: 'crossterm',
      submenu: [
        {
          label: localize('menubar.about', 'About {0}', 'crossterm'),
        },
        { type: 'separator' },
        {
          label: localize('menubar.preferences', 'Preferences...'),
          accelerator: null, // keyBinding[appPreferencesMenuId][keyBindingIdx], // 'Command+,',
          click: null, // mainWindow.preferenceClickHandler.bind(mainWindow),
          submenu: [
            {
              label: localize('menubar.settings', 'Settings'),
              accelerator: keyBinding[appSettingsMenuId][keyBindingIdx],
              click: (item, focusedWindow) => {}
            },
            {
              id: appShortcutsMenuId,
              appCommandId: appShortcutsCmdId,
              label: localize('menubar.keyboardShortcuts', 'Keyboard Shortcuts {0}', process.platform === 'darwin' ? '[⌘K ⌘S]' : 'Ctrl+K Ctrl+S'),
              accelerator: keyBinding[appShortcutsMenuId][keyBindingIdx],
              click: (item, focusedWindow) => focusedWindow?.webContents.send('execute command', appShortcutsCmdId),
            },
          ]
        },
        { type: 'separator' },
        {
          label: localize('menubar.hide', 'Hide {0}', 'crossterm'),
          accelerator: 'Command+H',
          // selector: 'hide:',
          role: 'hide'
        },
        {
          label: localize('menubar.hideOthers', 'Hide Others'),
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
          label: localize('menubar.quit', 'Quit'),
          accelerator: 'Command+Q',
          role: 'quit',
          /* click: () => {
            app.quit();
          }, */
        },
      ],
    };
  }

  /*addFileMenu(options: MenuItemConstructorOptions[]) {
    const fileSubmenu: MenuItemConstructorOptions[] = [];

    fileSubmenu.push(
      // {
      //   id: fileDisconnMenuId,
      //   label: '연결 끊기',
      //   accelerator: keyBinding[fileDisconnMenuId][keyBindingIdx],
      //   click: null
      // },
      {
        id: fileReconnMenuId,
        label: localize('menubar.reconnect', 'Reconnect'),
        accelerator: keyBinding[fileReconnMenuId][keyBindingIdx],
        click: null
      },
      {
        id: fileReconnAllMenuId,
        label: localize('menubar.reconnectAll', 'Reconnect All'),
        accelerator: null, // keyBinding[fileReconnAllMenuId][keyBindingIdx],
        click: null
      },
      { type: 'separator' },
      {
        id: fileImportMenuId,
        appCommandId: fileImportCmdId,
        label: localize('menubar.import', 'Import'),
        accelerator: null, // keyBinding[fileImportMenuId][keyBindingIdx],
        click: (item, focusedWindow) => focusedWindow?.webContents.send('execute command', fileImportCmdId),
      },
      {
        id: fileExportMenuId,
        appCommandId: fileExportCmdId,
        label: localize('menubar.export', 'Export'),
        accelerator: null, // keyBinding[fileExportMenuId][keyBindingIdx],
        click: (item, focusedWindow) => focusedWindow?.webContents.send('execute command', fileExportCmdId),
      },
    );

    if (process.platform === 'win32') {
      fileSubmenu.push({ type: 'separator' });
      fileSubmenu.push({
        id: filePreferencesMenuId,
        label: localize('menubar.preferences', 'Preferences...'),
        accelerator: keyBinding[filePreferencesMenuId][keyBindingIdx],
        click: null, // mainWindow.preferenceClickHandler.bind(mainWindow),
      });
    }

    options.push({
      label: localize('menubar.file', '&File'),
      submenu: fileSubmenu,
    });
  }

  addEditMenu(options: MenuItemConstructorOptions[]) {
    options.push({
      label: localize('menubar.edit', '&Edit'),
      submenu: [
        // { id: editUndoMenuId, label: 'Undo', accelerator: keyBinding[editUndoMenuId][keyBindingIdx], role: 'undo' },
        // { id: editRedoMenuId, label: 'Redo', accelerator: keyBinding[editRedoMenuId][keyBindingIdx], role: 'redo' },
        // { type: 'separator' },
        // { id: editCutMenuId, label: 'Cut', accelerator: keyBinding[editCutMenuId][keyBindingIdx], role: 'cut' },
        {
          // Note. role: 'copy'는 DOM 선택 영역만 복사한다. xterm의 선택은 DOM selection이 아니라
          //       직접 그린 것이므로 네이티브 role로는 복사되지 않는다. renderer 커맨드로 넘긴다.
          id: editCopyMenuId,
          label: localize('menubar.copy', 'Copy'), accelerator: keyBinding[editCopyMenuId][keyBindingIdx],
          // role: 'copy',
          click: (item, focusedWindow) => focusedWindow?.webContents.send('execute command', editCopyCmdId),
        },
        {
          id: editPasteMenuId,
          label: localize('menubar.paste', 'Paste'), accelerator: keyBinding[editPasteMenuId][keyBindingIdx],
          // role: 'paste',
          click: (item, focusedWindow) => focusedWindow?.webContents.send('execute command', editPasteCmdId),
        },
        // { id: editSelectAllMenuId, label: 'Select All', accelerator: keyBinding[editSelectAllMenuId][keyBindingIdx], role: 'selectAll' },
      ],
    });
  }

  addViewMenu(options: MenuItemConstructorOptions[]) {
    options.push({
      label: localize('menubar.view', '&View'),
      submenu: [],
    });
  }

  addTabMenu(options: MenuItemConstructorOptions[]) {
    options.push({
      label: localize('menubar.tab', 'Ta&b'),
      submenu: [
        {
          id: tabAlignMenuId,
          label: localize('menubar.align', 'Align'),
          accelerator: null, // keyBinding[tabAlignMenuId][keyBindingIdx],
          // click: () => {},
          submenu: [
            {
              id: tabAlignVerticalMenuId,
              label: localize('menubar.vertical', 'Vertical'),
              accelerator: null, // keyBinding[tabAlignVerticalMenuId][keyBindingIdx],
              click: (item, focusedWindow) => focusedWindow?.webContents.send('execute command', tabAlignVerticalCmdId),
            },
            {
              id: tabAlignHorizontalMenuId,
              label: localize('menubar.horizontal', 'Horizontal'),
              accelerator: null, // keyBinding[tabAlignHorizontalMenuId][keyBindingIdx],
              click: (item, focusedWindow) => focusedWindow?.webContents.send('execute command', tabAlignHorizontalCmdId),
            },
            {
              id: tabAlignTilesMenuId,
              label: localize('menubar.tiles', 'Tiles'),
              accelerator: null, // keyBinding[tabAlignTilesMenuId][keyBindingIdx],
              click: (item, focusedWindow) => focusedWindow?.webContents.send('execute command', tabAlignTilesCmdId),
            },
          ],
        },
        { type: 'separator' },
        {
          id: tabCloseOthersMenuId,
          label: localize('menubar.closeOthers', 'Close Others'),
          accelerator: null, // keyBinding[tabCloseOthersMenuId][keyBindingIdx],
          // click: () => {},
        },
        {
          id: tabCloseAllMenuId,
          label: localize('menubar.closeAll', 'Close All'),
          accelerator: null, // keyBinding[tabCloseAllMenuId][keyBindingIdx],
          // click: () => {},
        },
        { type: 'separator' },
        {
          id: tabToggleBroadcastInputMenuId,
          label: localize('menubar.toggleBroadcastInput', 'Toggle Broadcast Input'),
          accelerator: keyBinding[tabToggleBroadcastInputMenuId][keyBindingIdx],
          click: (item, focusedWindow) => focusedWindow?.webContents.send('execute command', tabToggleBroadcastInputCmdId),
        },
      ],
    });
  }

  addWindowMenu(options: MenuItemConstructorOptions[]) {
    options.push({
      label: localize('menubar.window', 'Window'),
      submenu: [],
    });
  }

  addHelpMenu(options: MenuItemConstructorOptions[]) {
    options.push({
      label: localize('menubar.help', '&Help'),
      submenu: [],
    });
  }*/
}
