import { MainEvents } from '../../common/ipc';
import { IpcChannel, IpcHandler } from '../IpcChannel';
import { ImportExistOption, ImportItemId, ImportService } from '../service/ImportService';

export class ImportServiceChannel implements IpcChannel {

  readonly handlers: ReadonlyMap<MainEvents, IpcHandler>;

  constructor(private readonly importService: ImportService) {
    this.handlers = new Map<MainEvents, IpcHandler>([
      [ 'app import load', (filePath: string) => this.importService.load(filePath) ],
      [ 'app import', (filePath: string, itemIds: ImportItemId[], onExist: ImportExistOption) =>
        this.importService.importFrom(filePath, itemIds, onExist) ],
    ]);
  }
}
