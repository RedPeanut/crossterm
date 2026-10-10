import fs from 'fs';
import path from 'path';
import { FileService, ReadFileOptions, Stat, WriteFileOptions, FileType } from '../../common/service/FileService';
import { DirentExt } from '../../common/Types';

export class MainFileService implements FileService {

  constructor() {
    // this.init();
    // this.registerIpcHandlers();
  }

  async readFile(filePath: string, opts: ReadFileOptions = {}): Promise<Buffer> {
    return await fs.promises.readFile(filePath);
  }

  async writeFileAtomic(filePath: string, content: string | Buffer, options: WriteFileOptions = {}): Promise<void> {
    const targetDir = path.dirname(filePath);

    await fs.promises.mkdir(targetDir, { recursive: true });

    // 1. 동일한 디렉토리 내에 유니크한 임시 파일명 생성
    // (동일 디렉토리에 두어야 OS 레벨에서 원자적 이동(Rename)이 보장됩니다)
    const tempFileName = `.tmp-${path.basename(filePath)}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const tempFilePath = path.join(targetDir, tempFileName);

    let fileHandle: fs.promises.FileHandle | null = null;

    try {
      // 2. 임시 파일 생성 및 쓰기 권한 오픈
      fileHandle = await fs.promises.open(tempFilePath, 'w', options.mode);

      // 3. 데이터 쓰기
      const data = typeof content === 'string' ? Buffer.from(content, options.encoding || 'utf8') : content;
      await fileHandle.write(data);

      // 4. OS 디스크 버퍼 플러시 (VSCode가 데이터 유실을 막기 위해 필수적으로 하는 작업)
      await fileHandle.sync();

      // 파일 핸들 닫기
      await fileHandle.close();
      fileHandle = null;

      // 5. 원자적 대체 (Atomic Replace)
      // POSIX 환경에서는 원자적으로 작동하며, Windows에서도 같은 드라이브 내라면 순식간에 교체됩니다.
      await fs.promises.rename(tempFilePath, filePath);

    } catch (error) {
      // 오류 발생 시 열려있는 핸들 닫기 및 임시 파일 정리
      if (fileHandle) {
        try { await fileHandle.close(); } catch {}
      }
      try { await fs.promises.unlink(tempFilePath); } catch {}

      throw error;
    }
  }

  async exists(path: string): Promise<boolean> {
    try {
      await fs.promises.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async readdirWithStat(path_: string): Promise<DirentExt[]> {
    const result: DirentExt[] = [];
    const reads: fs.Dirent[] = await fs.promises.readdir(path_, { withFileTypes: true });
    for (let i = 0; i < reads.length; i++) {
      const read: fs.Dirent = reads[i];
      const _path = read.path ? read.path : (read.isDirectory() ? (path_ + '/' + read.name) : path_);

      let isFile = false;
      let isDirectory = false;
      let isSymbolicLink = false;
      let mtime: Date = null;
      let size: number = 0;

      try {
        const lstat = await fs.promises.lstat(path.join(path_, read.name));

        isFile = lstat.isFile();
        isDirectory = lstat.isDirectory();
        isSymbolicLink = lstat.isSymbolicLink();
        mtime = lstat.mtime;
        size = lstat.size;
      } catch (error) {}

      result.push({
        // side: side,
        name: read.name,
        path: _path,

        isFile: isFile,
        isDirectory: isDirectory,
        isSymbolicLink: isSymbolicLink,

        mtime,
        size,
      });
    }
    return result;
  }

  async move(source: string, target: string, overwrite: boolean = false): Promise<void> {
    source = path.resolve(source);
    target = path.resolve(target);

    if (source === target) {
      return; // node.js 와 동일하게 경로가 같으면 no-op
    }

    // 폴더를 자기 자신의 하위로 이동 금지
    const relative = path.relative(source, target);
    if (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) {
      throw new Error(`Cannot move '${path.basename(source)}' into itself`);
    }

    const sourceStat = await fs.promises.lstat(source);
    const targetStat = await fs.promises.lstat(target).catch(() => null);

    if (targetStat) {
      // 대소문자만 다른 rename (a.txt -> A.txt) 은 case-insensitive 파일시스템(macOS, Windows)에서
      // 같은 파일을 가리키므로 존재 검사를 건너뛴다
      const isSameFile = sourceStat.dev === targetStat.dev && sourceStat.ino === targetStat.ino;
      if (!isSameFile) {
        if (!overwrite) {
          const error: NodeJS.ErrnoException = new Error(`'${path.basename(target)}' already exists`);
          error.code = 'EEXIST';
          throw error;
        }
        await fs.promises.rm(target, { recursive: true, force: true });
      }
    }

    try {
      await fs.promises.rename(source, target);
    } catch (error) {
      // 서로 다른 디스크 간 이동은 rename 이 불가능하므로 copy + delete 로 대체
      if ((error as NodeJS.ErrnoException).code === 'EXDEV') {
        await fs.promises.cp(source, target, { recursive: true, verbatimSymlinks: true });
        await fs.promises.rm(source, { recursive: true, force: true });
      } else {
        throw error;
      }
    }
  }

  /* registerIpcHandlers() {
    ipcMain.handle('file read', async (event, args: any[]) => { return this.readFile(args[0], args[1]); });
    ipcMain.handle('file write atomic', async (event, args: any[]) => {
      // return fileServiceImpl.writeFile(...args);
      return this.writeFileAtomic(args[0], args[1], args[2]);
    });
  } */
}