import { contextBridge, ipcRenderer, IpcRendererEvent, IpcRenderer } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  'api': {
    send(event: string, ...args: any[]) {
      ipcRenderer.send(event, args);
    },
    invoke(event: string, ...args: any[]) {
      return ipcRenderer.invoke(event, args);
    },
    on: (event: string, cb: (...args: unknown[]) => void) => {
      ipcRenderer.on(event, cb)
    },
    off: (event: string, cb: (...args: unknown[]) => void) => {
      ipcRenderer.removeListener(event, cb)
    },
  },
  'ipcRenderer': {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
