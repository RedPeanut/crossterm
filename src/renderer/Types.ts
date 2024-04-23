export interface Splittable {}

export interface Terminal_ {
  id: string;
  // properties that are describe to terminal
  // text, position, etc ...
}

export interface SplitItem {
  mode: 'horizontal' | 'vertical'; // string;
  list: (SplitItem | Terminal_[])[];
}

export function isTerminal(o: any) {
  return typeof o === 'object' && 'id' in o;
}

export function isSplitItem(o: any) {
  return typeof o === 'object' && 'mode' in o && 'list' in o;
}
