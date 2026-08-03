import { MainEvents } from '../../common/ipc';
import { IpcChannel, IpcHandler } from '../IpcChannel';
import { StorageService } from '../../common/service/StorageService';

export class StorageServiceChannel implements IpcChannel {

  readonly handlers: ReadonlyMap<MainEvents, IpcHandler>;

  constructor(private readonly storageService: StorageService) {
    this.handlers = new Map<MainEvents, IpcHandler>([
      ['storage getall', () =>
        this.storageService.getall()],
      ['storage set', (_, key: string, value: string) =>
        this.storageService.set(key, value)],
      ['storage delete', (_, key: string) =>
        this.storageService.delete(key)],
    ]);
  }
}
