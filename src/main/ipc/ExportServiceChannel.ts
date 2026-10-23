import { MainEvents } from '../../common/ipc';
import { IpcChannel, IpcHandler } from '../IpcChannel';
import { ExportService } from '../service/ExportService';

export class ExportServiceChannel implements IpcChannel {

  readonly handlers: ReadonlyMap<MainEvents, IpcHandler>;

  constructor(private readonly exportService: ExportService) {
    this.handlers = new Map<MainEvents, IpcHandler>([
      [ 'app export', (filePath: string) => this.exportService.exportTo(filePath) ],
    ]);
  }
}
