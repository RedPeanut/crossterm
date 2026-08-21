import { MainEvents } from '../../common/ipc';
import { DialogService } from '../../common/service/DialogService';
import { IpcChannel, IpcHandler } from '../IpcChannel';

export class DialogServiceChannel implements IpcChannel {

  readonly handlers: ReadonlyMap<MainEvents, IpcHandler>;

  constructor(private readonly service: DialogService) {
    this.handlers = new Map<MainEvents, IpcHandler>([
      [ 'dialog show messagebox', (options) => this.service.showMessageBox(options) ],
    ]);
  }
}
