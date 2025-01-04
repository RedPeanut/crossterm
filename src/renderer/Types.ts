import { TerminalItem } from "../common/Types";

export type Mode = 'horizontal' | 'vertical';

export interface SplitItem {
  // id: string;
  mode?: Mode; //'horizontal' | 'vertical';
  list: (SplitItem | TerminalItem[])[];
}

export function isSplitItem(o: any) {
  return 'mode' in o && 'list' in o && o.list.length > 0;
}