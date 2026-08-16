// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, IpcRendererEvent, IpcRenderer } from 'electron';
import { Channels } from '../common/ipc';

const electronHandler = {
  send(channel: Channels, ...args: any[]) {
    ipcRenderer.send(channel, args);
  },
  invoke(channel: Channels, ...args: any[]) {
    return ipcRenderer.invoke(channel, args);
  },
  /**
   * off is not working directly, because parameters are copied when they are sent over the bridge
   * ref) https://github.com/electron/electron/issues/45224
   *      https://www.electronjs.org/docs/latest/api/context-bridge#parameter--error--return-type-support
   */
  on: (channel: Channels, cb: (...args: unknown[]) => void): any => {
    const listener = (event: IpcRendererEvent, ...args: unknown[]) => cb(event, ...args);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
  once: (channel: string, cb: (...args: unknown[]) => void): any => {
    const listener = (event: IpcRendererEvent, ...args: unknown[]) => cb(event, ...args);
    ipcRenderer.once(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
  off: (channel: Channels, cb: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, cb)
  },
};

contextBridge.exposeInMainWorld('ipc', electronHandler);

export type ElectronHandler = typeof electronHandler;
