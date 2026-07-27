import fs, { promises } from 'fs';
import path from 'path';
import { FileService, ReadFileOptions, Stat, WriteFileOptions, FileType } from '../../common/service/FileService';

export class FileServiceImpl implements FileService {

  async readFile(filePath: string, opts: ReadFileOptions): Promise<Buffer> {
    return await promises.readFile(filePath);
  }

  async writeFileAtomic(filePath: string, content: string | Buffer, options: WriteFileOptions = {}): Promise<void> {
    const targetDir = path.dirname(filePath);

    // 1. 디렉토리가 없으면 생성 (VSCode 기본 동작)
    await promises.mkdir(targetDir, { recursive: true });

    // 2. 동일한 디렉토리 내에 유니크한 임시 파일명 생성
    // (동일 디렉토리에 두어야 OS 레벨에서 원자적 이동(Rename)이 보장됩니다)
    const tempFileName = `.tmp-${path.basename(filePath)}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const tempFilePath = path.join(targetDir, tempFileName);

    let fileHandle: promises.FileHandle | null = null;

    try {
      // 3. 임시 파일 생성 및 쓰기 권한 오픈
      fileHandle = await promises.open(tempFilePath, 'w', options.mode);

      // 4. 데이터 쓰기
      const data = typeof content === 'string' ? Buffer.from(content, options.encoding || 'utf8') : content;
      await fileHandle.write(data);

      // 5. OS 디스크 버퍼 플러시 (VSCode가 데이터 유실을 막기 위해 필수적으로 하는 작업)
      await fileHandle.sync();

      // 파일 핸들 닫기
      await fileHandle.close();
      fileHandle = null;

      // 6. 원자적 대체 (Atomic Replace)
      // POSIX 환경에서는 원자적으로 작동하며, Windows에서도 같은 드라이브 내라면 순식간에 교체됩니다.
      await promises.rename(tempFilePath, filePath);

    } catch (error) {
      // 오류 발생 시 열려있는 핸들 닫기 및 임시 파일 정리
      if (fileHandle) {
        try { await fileHandle.close(); } catch {}
      }
      try { await promises.unlink(tempFilePath); } catch {}

      throw error;
    }
  }

}