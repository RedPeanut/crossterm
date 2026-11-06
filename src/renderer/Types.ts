import { Settings } from "electron";
import { CommonTerminalItem } from "../common/Types";
import { Shortcuts } from "./part/content/Shortcuts";
import { Term } from "./part/content/Term";

export type ConnStatus = 'connecting' | 'connected' | 'error' | 'closed';

export interface RenderTerminalItem extends CommonTerminalItem {
  kind: 'terminal';
  selected?: boolean; // default: false
  active?: boolean; // default: false
  view?: Term;

  connStatus?: ConnStatus;
  onConnStatusChange?: (status: ConnStatus) => void;
  title: string;
}

export type Mode = 'horizontal' | 'vertical';
export type Group = RenderTerminalItem[];

export interface SplitItem {
  // id: string;
  mode?: Mode; //'horizontal' | 'vertical';
  list?: (SplitItem | Group)[];
}

export interface SettingsItem {
  // kind: string = 'settings'; // An interface property cannot have an initializer. ts(1246)
  kind: 'settings';
  selected?: boolean;
  active?: boolean;
  view?: Settings;
}

export interface ShortcutsItem {
  kind: 'shortcuts';
  selected?: boolean;
  active?: boolean;
  view?: Shortcuts;
}

export type TabItem = RenderTerminalItem | SettingsItem | ShortcutsItem;
// export type Group = TabItem[];

/*
(Render|Common|Main)TerminalItem
SettingsItem
ShortcutsItem

-- 체크할부분
BodyLayout.recreate: create dom
SessionPart.createTerminal: create main terminal process
*/

export function isSplitItem(o: any) {
  return 'mode' in o && 'list' in o && o.list.length > 0;
}

export enum Severity {
  Ignore,
  Info,
  Warning,
  Error
}