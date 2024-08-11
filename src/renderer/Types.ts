import { TerminalItem } from "common/Types";

export type ListItemType = 'local' | 'remote' | 'group' | 'folder';
export type FolderModeType = 0 | 1 | 2; // 0: 기본값; 1: 단일 선택 2: 다중 선택

export interface ListItem {
  id: string;
  title?: string;
  on?: boolean;
  type?: ListItemType;

  // remote
  url?: { host: string, port: number, username: string, password: string };
  size?: { row: number, col: number }
  last_refresh?: string;
  last_refresh_ms?: number;
  refresh_interval?: number; // 단위: 초

  // // group
  // include?: string[];

  // folder
  folder_mode?: FolderModeType;
  folder_open?: boolean;
  children?: ListItem[];

  // is_sys?: boolean;

  [key: string]: any; // ??
}

export interface TreeNodeData {
  id: string;
  title?: string;
  can_select?: boolean; // 선택 가능 여부, 기본값은 true
  can_drag?: boolean; // 드래그 가능 여부, 기본값은 true
  can_drop_before?: boolean; // 이전 드롭이 허용되는지 여부, 기본값은 true
  can_drop_in?: boolean; // 드롭인 허용 여부, 기본값은 true
  can_drop_after?: boolean; // 이후 드롭을 허용할지 여부, 기본값은 true
  is_collapsed?: boolean;
  children?: TreeNodeData[];

  [key: string]: any;
}

/* export interface Splittable {}

export interface Terminal_ {
  id: string;
  selected?: boolean; // default: false
  active?: boolean; // default: false

  // properties that are describe to terminal
  // text, position, etc ...
}

export interface Settings_ {
  id: string;
  selected?: boolean; // default: false
  active?: boolean; // default: false
}

type ListItemType_ =
  SplitItem
  | (Terminal_ | Settings_)[];

export interface SplitItem {
  mode: 'horizontal' | 'vertical'; // string;
  list: (SplitItem | Terminal_[])[];
}

export function isTerminal_(o: any) {
  return typeof o === 'object' && 'id' in o;
}

export function isSplitItem(o: any) {
  return typeof o === 'object' && 'mode' in o && 'list' in o;
} */

/* export interface Terminal {
  id: string,
  selected?: boolean; // default: false
  active?: boolean; // default: false

  // properties that are describe to terminal
  // text, position, etc ...
} */

export type Mode = 'horizontal' | 'vertical';

export interface SplitItem {
  // id: string;
  mode?: Mode; //'horizontal' | 'vertical';
  list: (SplitItem | TerminalItem[])[];
}

export function isSplitItem(o: any) {
  return 'mode' in o && 'list' in o && o.list.length > 0;
}

export interface FlatItem {
  id: string;
  pid?: string;
  mode?: 'vertical' | 'horizontal';
  selected?: boolean; // default: false
  active?: boolean; // default: false
  children?: FlatItem[];
}

export function isSplitItem_(o: any) {
  return typeof o === 'object' && 'mode' in o && 'children' in o;
}
