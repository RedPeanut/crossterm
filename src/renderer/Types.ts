export interface Splittable {}

export interface Terminal {
  id: string;
  // properties that are describe to terminal
  // text, position, etc ...
}

export interface SplitItem {
  mode: 'horizontal' | 'vertical'; // string;
  list: (SplitItem | Terminal[])[];
}

export function isTerminal(o: any) {
  return typeof o === 'object' && 'id' in o;
}

export function isSplitItem(o: any) {
  return typeof o === 'object' && 'mode' in o && 'list' in o;
}
