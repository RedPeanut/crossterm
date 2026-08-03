import { FileService, ReadFileOptions, WriteFileOptions } from '../../common/service/FileService';
import { MainEvents } from '../../common/ipc';
import { IpcChannel, IpcHandler } from '../IpcChannel';

export class FileServiceChannel implements IpcChannel {

  readonly handlers: ReadonlyMap<MainEvents, IpcHandler>;

  constructor(private readonly fileService: FileService) {
    this.handlers = new Map<MainEvents, IpcHandler>([
      ['file read', (filePath: string, opts?: ReadFileOptions) =>
        this.fileService.readFile(filePath, opts)],
      ['file write atomic', (filePath: string, content: string | Buffer, opts?: WriteFileOptions) =>
        this.fileService.writeFileAtomic(filePath, content, opts)],
    ]);
  }
}
