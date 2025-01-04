export interface TerminalOptions {
  uid: string;
  cwd?: string;
  splitDirection?: 'HORIZONTAL' | 'VERTICAL';
  // activeUid?: string | null;
  // isNewGroup?: boolean;
  rows?: number;
  cols?: number;
  shell?: string;
  shellArgs?: string[];
  // profile?: string;
};
