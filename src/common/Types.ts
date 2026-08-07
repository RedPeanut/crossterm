import { Term } from "../renderer/part/term/Term";

export type ConnStatus = 'connecting' | 'connected' | 'error' | 'closed';

export interface TerminalItem {
  uid: string,

  // in renderer
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

// app
export const appPreferencesMenuId = 'app.preferences';
export const appQuitMenuId = 'app.quit';

// most application specific menu category exists between edit n window

// file
export const filePreferencesMenuId = 'file.preferences';

// edit
export const editUndoMenuId = 'edit.undo';
export const editRedoMenuId = 'edit.redo';
export const editCutMenuId = 'edit.cut';
export const editCopyMenuId = 'edit.copy';
export const editPasteMenuId = 'edit.paste';
export const editSelectAllMenuId = 'edit.selectAll';

// view

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