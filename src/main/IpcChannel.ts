// ipcMain을 아는 파일이 이 하나로 줄어드는 게 요점
import { ipcMain } from 'electron';
import { IDisposable } from '../common/base/lifecycle';
import { MainEvents } from '../common/ipc';

export type IpcHandler = (...args: any[]) => unknown;

/**
 * Exposes a service to the renderer. Implementations own the channel-name to
 * method mapping and must never touch `ipcMain` themselves, so the service
 * they wrap stays constructible outside of Electron.
 */
export interface IpcChannel {
  readonly handlers: ReadonlyMap<MainEvents, IpcHandler>;
}

/**
 * Registers every handler of `channel` on `ipcMain`. Disposing unregisters
 * them, so repeated registration (tests, electronmon reloads) does not throw
 * "Attempted to register a second handler for ...".
 */
export function registerIpcChannel(channel: IpcChannel): IDisposable {
  const registered: MainEvents[] = [];

  for(const [name, handler] of channel.handlers) {
    // preload wraps every invoke argument list into a single array
    ipcMain.handle(name, (_event, args: unknown[] = []) => handler(...args));
    registered.push(name);
  }

  return { dispose: () => registered.forEach(name => ipcMain.removeHandler(name)) };
}
