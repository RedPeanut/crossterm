import { ElectronHandler } from 'main/preload';

declare global {
  interface Window {
    ipc: ElectronHandler;
  }
}

export {};
