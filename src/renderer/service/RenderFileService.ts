import { FileService, FileType, ReadFileOptions, Stat, WriteFileOptions } from "../../common/service/FileService";

export class FileServiceImpl implements FileService {
  async readFile(filePath: string, opts: ReadFileOptions): Promise<Buffer> {
    const buffer = await window.ipc.invoke('file read', [filePath, opts]); // as Buffer;
		return buffer;
  }

  async writeFileAtomic(filePath: string, content: string | Buffer, opts: WriteFileOptions): Promise<void> {
    return await window.ipc.invoke('file write atomic', [filePath, content, opts]);
  }
}