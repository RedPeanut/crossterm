export interface TerminalItem {
  uid: string,

  // in renderer
  selected?: boolean; // default: false
  active?: boolean; // default: false

  // in main
  // properties that are describe to terminal
  // text, position, etc ...
  type?: string;

  size?: {
    row: number;
    col: number;
  }

  url?: {
    host: string;
    port: number;
    username: string;
    password: string;
  }
}

export type Mode = 'horizontal' | 'vertical';

export interface SplitItem {
  // id: string;
  mode?: Mode; //'horizontal' | 'vertical';
  list: (SplitItem | TerminalItem[])[];
}

export function isSplitItem(o: any) {
  return 'mode' in o && 'list' in o && o.list.length > 0;
}