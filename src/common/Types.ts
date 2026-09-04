import { Term } from "../renderer/part/term/Term";

export type ConnStatus = 'connecting' | 'connected' | 'error' | 'closed';

export interface TerminalItem {
  uid: string,

  // in render
  selected?: boolean; // default: false
  active?: boolean; // default: false
  term?: Term;
  connStatus?: ConnStatus;
  // onConnStatusChange?: (status: ConnStatus) => void;

  // in main
  // properties that are describe to terminal
  // text, position, etc ...
  type?: string; // 'folder' | 'local' | 'remote'

  /* size?: {
    row: number;
    col: number;
  } */

  url?: {
    host: string;
    port: number;
    username: string;
    password: string;
  }
}

export interface CommonMenuItem {
  id?: number | string;
  commandId?: string;
  label?: string;
  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
  accelerator?: string;
  enabled?: boolean;
  visible?: boolean;
  checked?: boolean;
  clickable?: boolean;
}

export interface SerializableMenuItem extends CommonMenuItem {
  submenu?: SerializableMenuItem[];
}

export interface ContextMenuItem extends CommonMenuItem {
  click?: (args: any[]) => void;
  submenu?: ContextMenuItem[];
}

export interface ContextMenuEvent {
  shiftKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

export interface PopupOptions {
  x?: number;
  y?: number;
  // positioningItem?: number;
}

// app
export const appPreferencesMenuId = 'app.preferences';
export const appSettingsMenuId = 'app.settings';
export const appShortcutsMenuId = 'app.shortcuts';
export const appShortcutsCommandId = 'app.shortcuts.cmd';
export const appQuitMenuId = 'app.quit';

// most application specific menu category exists between edit n window

// file
export const filePreferencesMenuId = 'file.preferences';
export const fileSettingsMenuId = 'file.settings';
export const fileShortcutsMenuId = 'file.shortcuts';
export const fileDisconnMenuId = 'file.disconn';
export const fileReconnMenuId = 'file.reconn';
export const fileReconnAllMenuId = 'file.reconn.all';

// edit
export const editUndoMenuId = 'edit.undo';
export const editRedoMenuId = 'edit.redo';
export const editCutMenuId = 'edit.cut';
export const editCopyMenuId = 'edit.copy';
export const editCopyCommandId = 'edit.copy.cmd';
export const editPasteMenuId = 'edit.paste';
export const editPasteCommandId = 'edit.paste.cmd';
export const editSelectAllMenuId = 'edit.selectAll';

// view

// tab
export const tabAlignMenuId = 'tab.align';
export const tabAlignVerticalMenuId = 'tab.align.vertical';
export const tabAlignHorizontalMenuId = 'tab.align.horizontal';
export const tabAlignTilesMenuId = 'tab.align.tiles';

// window

export interface MenubarEnableElem { id: string, enable: boolean }
export interface MenubarEnable { [id: string]: MenubarEnableElem[] }

export interface Children<T> {
  children?: T[];
  isCollapsed?: boolean;
}

export interface DirentExtWithC extends Children<DirentExtWithC> {
  name: string;
  path: string;

  isFile: boolean;
  isDirectory: boolean;
  isSymbolicLink: boolean;

  // stat
  mtime: Date;
  size: number;
}

export interface DirentExt {
  name: string;
  path: string;

  isFile: boolean;
  isDirectory: boolean;
  isSymbolicLink: boolean;

  // stat
  mtime: Date;
  size: number;
}

export type ListItemType = 'local' | 'remote' | 'folder'; // | 'group' | 'blank';
// export type FolderModeType = 0 | 1 | 2; // 0: 기본값; 1: 단일 선택 2: 다중 선택

export interface ListItemElem extends Partial<DirentExt>, Children<ListItemElem> {
  type?: ListItemType;
  title?: string;
  id: string;
  // children?: ListItemElem[];
  // isCollapsed?: boolean;

  // only remote
  url?: { host: string, port: number, username: string, password: string };
  // size?: { row: number, col: number }
}