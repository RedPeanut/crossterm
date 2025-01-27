import { TerminalItem } from "../common/Types";

export type Mode = 'horizontal' | 'vertical';
export type Group = TerminalItem[];

export interface SplitItem {
  // id: string;
  mode?: Mode; //'horizontal' | 'vertical';
  list: (SplitItem | Group)[];
}

export function isSplitItem(o: any) {
  return 'mode' in o && 'list' in o && o.list.length > 0;
}