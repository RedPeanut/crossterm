import {
  appPreferencesMenuId,
  appQuitMenuId,
  filePreferencesMenuId,

  editUndoMenuId,
  editRedoMenuId,
  editCutMenuId,
  editCopyMenuId,
  editPasteMenuId,
  editSelectAllMenuId,
} from "./Types";

// { id: [Win, Mac] }
export const keyBinding: { [id: string]: string[] } = {};
keyBinding[appPreferencesMenuId] = [ null, 'Cmd+,' ];
keyBinding[appQuitMenuId] = [ null, 'Cmd+Q' ];
keyBinding[filePreferencesMenuId] =  ['Ctrl+P', null ];

keyBinding[editUndoMenuId] = [ 'Ctrl+Z', 'Cmd+Z' ];
keyBinding[editRedoMenuId] = [ 'Shift[+Ctrl+Z', 'Shift+Cmd+Z' ];
keyBinding[editCutMenuId] = [ 'Ctrl+X', 'Cmd+X' ];
keyBinding[editCopyMenuId] = [ 'Ctrl+C', 'Cmd+C' ];
keyBinding[editPasteMenuId] = [ 'Ctrl+V', 'Cmd+V' ];
keyBinding[editSelectAllMenuId] = [ 'Ctrl+A', 'Cmd+A' ];