import { MainEvents } from '../../common/ipc';
import { IpcChannel, IpcHandler } from '../IpcChannel';
import { StorageService } from '../../common/service/StorageService';

export class StorageServiceChannel implements IpcChannel {

  readonly handlers: ReadonlyMap<MainEvents, IpcHandler>;

  constructor(private readonly storageService: StorageService) {
    this.handlers = new Map<MainEvents, IpcHandler>([
      [ 'storage getall', (_) =>
        this.storageService.getall() ],
      [ 'storage set',
        // (args: any[]) => {
        (...args: any[]) => {
        // (_, key: string, value: string) => {
          // console.log('args =', args);
          // const [, key, value] = args;
          // console.log('key =', key, ', value =', value);
          console.log('args =', args);
          const [ key, value ] = args;
          this.storageService.set(key, value);
        }
      ],
      [ 'storage delete', (_, key: string) =>
        this.storageService.delete(key) ],
    ]);
  }
}
