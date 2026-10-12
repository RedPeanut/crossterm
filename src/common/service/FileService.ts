import { DirentExt } from "../Types";

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

export interface DeleteOptions {
  /** 휴지통으로 보낸다 (main 에서만 동작) */
  useTrash?: boolean;
}

export interface FileService {
  readFile(filePath: string, opts?: ReadFileOptions): Promise<Buffer>;
  writeFileAtomic(filePath: string, content: string | Buffer, options?: WriteFileOptions): Promise<void>;
  exists(path: string): Promise<boolean>;
  readdirWithStat(path: string): Promise<DirentExt[]>;
  move(source: string, target: string, overwrite?: boolean): Promise<void>;
  copy(source: string, target: string, overwrite?: boolean): Promise<void>;
  del(path: string, opts?: DeleteOptions): Promise<void>;
  createFolder(path: string): Promise<void>;
}