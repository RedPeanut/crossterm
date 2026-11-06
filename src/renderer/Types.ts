import { CommonTerminalItem } from "../common/Types";
import { Term } from "./part/term/Term";

export type ConnStatus = 'connecting' | 'connected' | 'error' | 'closed';

export interface RenderTerminalItem extends CommonTerminalItem {
  selected?: boolean; // default: false
  active?: boolean; // default: false
  term?: Term;
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

export function isSplitItem(o: any) {
  return 'mode' in o && 'list' in o && o.list.length > 0;
}

export enum Severity {
  Ignore,
  Info,
  Warning,
  Error
}