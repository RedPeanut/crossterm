import {
  appPreferencesMenuId,
  appSettingsMenuId,
  appShortcutsMenuId,
  appQuitMenuId,

  filePreferencesMenuId,
  fileSettingsMenuId,
  fileShortcutsMenuId,
  fileDisconnMenuId,
  fileReconnMenuId,
  fileReconnAllMenuId,

  editUndoMenuId,
  editRedoMenuId,
  editCutMenuId,
  editCopyMenuId,
  editPasteMenuId,
  editSelectAllMenuId,

  tabAlignMenuId,
  tabAlignVerticalMenuId,
  tabAlignHorizontalMenuId,
  tabAlignTilesMenuId,
} from "./Types";

// { id: [Win, Mac] }
export const keyBinding: { [id: string]: string[] } = {};
keyBinding[appPreferencesMenuId] = [ null, null ];
keyBinding[appSettingsMenuId] = [ null, 'Cmd+,' ];
keyBinding[appShortcutsMenuId] = [ null, null ];
keyBinding[appQuitMenuId] = [ null, 'Cmd+Q' ];

keyBinding[filePreferencesMenuId] =  [ null, null ];
keyBinding[fileSettingsMenuId] = [ 'Ctrl+P', null ];
keyBinding[fileShortcutsMenuId] = [ null, null ];
keyBinding[fileDisconnMenuId] =  [ 'Alt+C', 'Alt+C' ];
keyBinding[fileReconnMenuId] =  [ 'Ctrl+Shift+R', 'Cmd+Shift+R' ];
keyBinding[fileReconnAllMenuId] =  [ null, null ];

keyBinding[editUndoMenuId] = [ 'Ctrl+Z', 'Cmd+Z' ];
keyBinding[editRedoMenuId] = [ 'Shift+Ctrl+Z', 'Shift+Cmd+Z' ];
keyBinding[editCutMenuId] = [ 'Ctrl+X', 'Cmd+X' ];
keyBinding[editCopyMenuId] = [ 'Ctrl+C', 'Cmd+C' ];
keyBinding[editPasteMenuId] = [ 'Ctrl+V', 'Cmd+V' ];
keyBinding[editSelectAllMenuId] = [ 'Ctrl+A', 'Cmd+A' ];