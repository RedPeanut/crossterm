import fs from 'fs';
import path from 'path';
import { ipcMain } from 'electron';
import { FileService, ReadFileOptions, Stat, WriteFileOptions, FileType } from '../../common/service/FileService';
import { DirentExt } from '../../common/Types';

export class MainFileService implements FileService {

  constructor() {
    // this.init();
    this.registerIpcHandlers();
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
    for(let i = 0; i < reads.length; i++) {
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
      } catch(error) {}

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

  registerIpcHandlers() {
    ipcMain.handle('file read', async (event, args: any[]) => { return this.readFile(args[0], args[1]); });
    ipcMain.handle('file write atomic', async (event, args: any[]) => {
      // return fileServiceImpl.writeFile(...args);
      return this.writeFileAtomic(args[0], args[1], args[2]);
    });
  }
}