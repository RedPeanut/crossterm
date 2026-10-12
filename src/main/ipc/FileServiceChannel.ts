import { DeleteOptions, FileService, ReadFileOptions, WriteFileOptions } from '../../common/service/FileService';
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
      ['file exists', (path: string) =>
        this.fileService.exists(path)],
      ['file move', (source: string, target: string, overwrite?: boolean) =>
        this.fileService.move(source, target, overwrite)],
      ['file copy', (source: string, target: string, overwrite?: boolean) =>
        this.fileService.copy(source, target, overwrite)],
      ['file delete', (path: string, opts?: DeleteOptions) =>
        this.fileService.del(path, opts)],
      ['folder create', (path: string) =>
        this.fileService.createFolder(path)],
    ]);
  }
}
