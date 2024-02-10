import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  api: {
    on: (event: string, cb: (...args: unknown[]) => void) => {
      ipcRenderer.on(event, cb)
    },
    off: (event: string, cb: (...args: unknown[]) => void) => {
      ipcRenderer.removeListener(event, cb)
    },
    aync: (name: string, ...args: unknown[]) => {
      return ipcRenderer.invoke('async', {
        name,
        args
      })
    },
    sync: (name: string, ...args: unknown[]) => {
      return ipcRenderer.sendSync('sync-func', {
        name,
        args
      })
    }
  },
  ipcRenderer: {
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
