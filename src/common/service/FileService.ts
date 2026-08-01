export enum FileType {
  Unknown = 0,
  File = 1,
  Directory = 2,
  SymbolicLink = 64
}

export enum FilePermission {
  Readonly = 1,
  Locked = 2,
  Executable = 4
}

export interface Stat {
  readonly type: FileType;
  readonly mtime: number;
  readonly ctime: number;
  readonly size: number;
  readonly permissions?: FilePermission;
}

export interface ReadFileOptions {}

export interface WriteFileOptions {
  encoding?: BufferEncoding;
  mode?: number;
}

export interface FileService {
  readFile(filePath: string, opts: ReadFileOptions): Promise<Buffer>;
  writeFileAtomic(filePath: string, content: string | Buffer, options: WriteFileOptions): Promise<void>;
  // TODO: move, copy, del, etc ..
}