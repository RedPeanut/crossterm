import { MainEvents } from '../../common/ipc';
import { IpcChannel, IpcHandler } from '../IpcChannel';
import { AppService } from '../service/AppService';

export class AppServiceChannel implements IpcChannel {

  readonly handlers: ReadonlyMap<MainEvents, IpcHandler>;

  constructor(private readonly appService: AppService) {
    this.handlers = new Map<MainEvents, IpcHandler>([
      ['read sessions dir', () =>
        this.appService.readSessionsDir()],
    ]);
  }
}
