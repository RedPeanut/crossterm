import { contextBridge, ipcRenderer, IpcRendererEvent, IpcRenderer } from 'electron';

export type MainEvents =
  'new'
  | 'data'
  | 'maximize'
  | 'minimize'
  | 'resize'
  | 'open context menu'
  | 'close'
  | 'command'
;

export type RenderEvents =
  'terminal add'
  | 'terminal data'
  | 'terminal exit'
;

export type Channels = MainEvents | RenderEvents;

const electronHandler = {
  send(channel: Channels, ...args: any[]) {
    ipcRenderer.send(channel, args);
  },
  invoke(channel: Channels, ...args: any[]) {
    return ipcRenderer.invoke(channel, args);
  },
  on: (channel: Channels, cb: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, cb)
  },
  off: (channel: Channels, cb: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, cb)
  },
};

contextBridge.exposeInMainWorld('ipc', electronHandler);

export type ElectronHandler = typeof electronHandler;
