import { localize } from '../../common/nls';
import {
  fileReconnCmdId, fileReconnAllCmdId, fileImportCmdId, fileExportCmdId,
  editCopyCmdId, editPasteCmdId,
  tabAlignVerticalCmdId, tabAlignHorizontalCmdId, tabAlignTilesCmdId,
  tabCloseOthersCmdId, tabCloseAllCmdId,
  tabToggleBroadcastInputCmdId,
} from '../../common/Types';
import { MenuId, menuRegistry } from './MenuRegistry';

/**
 * 메뉴바 contribution.
 *
 * main의 `Menubar.ts`에 있던 메뉴 구조를 옮긴 것. 커맨드 핸들러와 단축키는 `key/keybindings.ts`에 있고
 * 여기서는 "어느 메뉴에 어떤 커맨드를 놓을지"만 선언한다.
 *
 * Note. 아직 커맨드가 없는 항목(Reconnect, Reconnect All, Close Others, Close All, Preferences)은 넣지 않았다.
 *       커맨드를 등록한 뒤 여기에 한 줄 추가하면 UI/네이티브 메뉴 양쪽에 같이 나타난다.
 * Note. mac의 application 메뉴(About, Hide, Quit 등 role 항목)는 main에 그대로 둔다.
 */

// 최상위 메뉴바
menuRegistry.appendMenuItems([
  { id: MenuId.MenubarMainMenu, item: { submenu: MenuId.MenubarFileMenu, title: localize('menubar.file', '&File'), order: 1 } },
  { id: MenuId.MenubarMainMenu, item: { submenu: MenuId.MenubarEditMenu, title: localize('menubar.edit', '&Edit'), order: 2 } },
  { id: MenuId.MenubarMainMenu, item: { submenu: MenuId.MenubarViewMenu, title: localize('menubar.view', '&View'), order: 3 } },
  { id: MenuId.MenubarMainMenu, item: { submenu: MenuId.MenubarTabMenu, title: localize('menubar.tab', 'Ta&b'), order: 4 } },
  { id: MenuId.MenubarMainMenu, item: { submenu: MenuId.MenubarWindowMenu, title: localize('menubar.window', 'Window'), order: 5 } },
  { id: MenuId.MenubarMainMenu, item: { submenu: MenuId.MenubarHelpMenu, title: localize('menubar.help', '&Help'), order: 6 } },
]);

// File
menuRegistry.appendMenuItems([
  { id: MenuId.MenubarFileMenu, item: { command: { id: fileReconnCmdId, title: localize('menubar.reconnect', 'Reconnect') }, group: '1_reconn', order: 1 } },
  { id: MenuId.MenubarFileMenu, item: { command: { id: fileReconnAllCmdId, title: localize('menubar.reconnectAll', 'Reconnect All') }, group: '1_reconn', order: 2 } },
  { id: MenuId.MenubarFileMenu, item: { command: { id: fileImportCmdId, title: localize('menubar.import', 'Import') }, group: '2_import_export', order: 1 } },
  { id: MenuId.MenubarFileMenu, item: { command: { id: fileExportCmdId, title: localize('menubar.export', 'Export') }, group: '2_import_export', order: 2 } },
]);

// Edit
menuRegistry.appendMenuItems([
  { id: MenuId.MenubarEditMenu, item: { command: { id: editCopyCmdId, title: localize('menubar.copy', 'Copy') }, group: '2_clipboard', order: 1 } },
  { id: MenuId.MenubarEditMenu, item: { command: { id: editPasteCmdId, title: localize('menubar.paste', 'Paste') }, group: '2_clipboard', order: 2 } },
]);

// Tab
menuRegistry.appendMenuItems([
  { id: MenuId.MenubarTabMenu, item: { submenu: MenuId.MenubarTabAlignMenu, title: localize('menubar.align', 'Align'), group: '1_align', order: 1 } },
  { id: MenuId.MenubarTabAlignMenu, item: { command: { id: tabAlignVerticalCmdId, title: localize('menubar.vertical', 'Vertical') }, order: 1 } },
  { id: MenuId.MenubarTabAlignMenu, item: { command: { id: tabAlignHorizontalCmdId, title: localize('menubar.horizontal', 'Horizontal') }, order: 2 } },
  { id: MenuId.MenubarTabAlignMenu, item: { command: { id: tabAlignTilesCmdId, title: localize('menubar.tiles', 'Tiles') }, order: 3 } },

  { id: MenuId.MenubarTabMenu, item: { command: { id: tabCloseOthersCmdId, title: localize('menubar.closeOthers', 'Close Others') }, group: '2_close', order: 1 } },
  { id: MenuId.MenubarTabMenu, item: { command: { id: tabCloseAllCmdId, title: localize('menubar.closeAll', 'Close All') }, group: '2_close', order: 2 } },

  { id: MenuId.MenubarTabMenu, item: { command: { id: tabToggleBroadcastInputCmdId, title: localize('menubar.toggleBroadcastInput', 'Toggle Broadcast Input') }, group: '3_broadcast', order: 1 } },
]);
