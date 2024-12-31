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