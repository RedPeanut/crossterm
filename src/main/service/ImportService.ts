import fs from 'fs';
import path from 'path';
import { FileService } from '../../common/service/FileService';
import { EnvironmentService } from '../../common/service/EnvironmentService';
import { AppService } from './AppService';
import { EXPORT_FORMAT, EXPORT_VERSION, ExportedData, ExportedSessionNode } from './ExportService';

export type ImportItemId = 'sessions' | 'settings';

/** 가져올 대상에 같은 이름이 이미 있을 때 */
export type ImportExistOption = 'overwrite' | 'ignore' | 'rename';

/** 원본 파일에 들어 있는 항목 (가져오기 팝업 2번째 페이지의 한 줄) */
export interface ImportItem {
  id: ImportItemId;
  name: string;
  type: string;
  count: number;
}

/**
 * 가져오기.
 * ExportService 가 만든 JSON 파일을 읽어 세션 폴더와 설정 파일로 되돌린다.
 */
export class ImportService {

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly fileService: FileService,
    private readonly appService: AppService,
    /** settings.json 을 바꾼 뒤 설정을 다시 읽게 한다 */
    private readonly onDidImportSettings: () => Promise<void> = async () => {},
  ) {}

  /** @returns 원본 파일에 들어 있는 항목. 개수가 0 인 항목은 뺀다 */
  async load(filePath: string): Promise<ImportItem[]> {
    const data = await this.read(filePath);

    const items: ImportItem[] = [
      { id: 'sessions', name: 'Sessions', type: 'Session files', count: countSessions(data.sessions) },
      { id: 'settings', name: 'Settings', type: 'User settings (settings.json)', count: data.settings == null ? 0 : 1 },
    ];
    return items.filter(item => item.count > 0);
  }

  /** @returns 결과창에 표시할 로그 */
  async importFrom(filePath: string, itemIds: ImportItemId[], onExist: ImportExistOption): Promise<string[]> {
    const data = await this.read(filePath);
    const log: string[] = [];

    if (itemIds.includes('sessions')) {
      const sessionsDir = this.appService.getSessionsDir();
      await fs.promises.mkdir(sessionsDir, { recursive: true });
      await this.writeSessions(sessionsDir, data.sessions, onExist, log);
    }

    if (itemIds.includes('settings') && data.settings != null) {
      const settingsPath = path.join(this.environmentService.userDataPath, 'settings.json');
      const content = typeof data.settings === 'string' ? data.settings : JSON.stringify(data.settings, null, 2);
      const written = await this.writeFile(settingsPath, content, onExist, log);
      // 이름을 바꿔 저장했으면 settings.json 은 그대로이므로 다시 읽을 필요가 없다
      if (written === settingsPath) await this.onDidImportSettings();
    }

    return log;
  }

  private async read(filePath: string): Promise<ExportedData> {
    const text = (await this.fileService.readFile(filePath)).toString('utf8');

    let data: ExportedData;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Not a crossterm export file (invalid JSON)');
    }
    if (!data || data.format !== EXPORT_FORMAT) throw new Error('Not a crossterm export file');
    if (data.version > EXPORT_VERSION) throw new Error(`Unsupported export version ${data.version} (this app supports up to ${EXPORT_VERSION})`);

    if (!Array.isArray(data.sessions)) data.sessions = [];
    validateSessions(data.sessions);
    return data;
  }

  private async writeSessions(dir: string, nodes: ExportedSessionNode[], onExist: ImportExistOption, log: string[]): Promise<void> {
    for (const node of nodes) {
      const target = path.join(dir, node.name);

      if (node.type === 'folder') {
        // 같은 이름의 폴더가 있으면 합친다. 같은 이름의 파일이 있을 때만 충돌로 본다
        let folder = target;
        const stat = await fs.promises.lstat(target).catch(() => null);
        if (stat && !stat.isDirectory()) {
          log.push(`Copying ${target}`);
          if (onExist === 'ignore') {
            log.push('Duplicated. Ignored by user option');
            continue;
          }
          if (onExist === 'overwrite') {
            await this.fileService.del(target);
            log.push(`Duplicated. Overwrite to ${node.name}`);
          } else {
            folder = await uniquePath(target);
            log.push(`Duplicated. Renamed to ${path.basename(folder)}`);
          }
        }
        await fs.promises.mkdir(folder, { recursive: true });
        await this.writeSessions(folder, node.children, onExist, log);
      } else {
        const content = node.raw ?? JSON.stringify(node.data ?? {}, null, 2);
        await this.writeFile(target, content, onExist, log);
      }
    }
  }

  /** @returns 실제로 쓴 경로. 무시했으면 null */
  private async writeFile(target: string, content: string, onExist: ImportExistOption, log: string[]): Promise<string | null> {
    log.push(`Copying ${target}`);

    const stat = await fs.promises.lstat(target).catch(() => null);
    let written = target;
    if (stat) {
      if (onExist === 'ignore') {
        log.push('Duplicated. Ignored by user option');
        return null;
      }
      if (onExist === 'overwrite') {
        // 같은 이름의 폴더는 덮어쓸 수 없으므로 지우고 쓴다
        if (stat.isDirectory()) await this.fileService.del(target);
        log.push(`Duplicated. Overwrite to ${path.basename(target)}`);
      } else {
        written = await uniquePath(target);
        log.push(`Duplicated. Renamed to ${path.basename(written)}`);
      }
    }

    await this.fileService.writeFileAtomic(written, content);
    return written;
  }
}

function countSessions(nodes: ExportedSessionNode[]): number {
  return nodes.reduce((sum, node) => sum + (node.type === 'folder' ? countSessions(node.children) : 1), 0);
}

/** 세션 이름이 경로를 벗어나지 못하게 한다 (예: '../x', 'a/b') */
function validateSessions(nodes: ExportedSessionNode[]): void {
  for (const node of nodes) {
    const name = node?.name;
    if (typeof name !== 'string' || name === '' || name === '.' || name === '..' || /[\\/]/.test(name) || name.includes('\0'))
      throw new Error(`Invalid session name: ${JSON.stringify(name)}`);

    if (node.type === 'folder') {
      if (!Array.isArray(node.children)) node.children = [];
      validateSessions(node.children);
    } else if (node.type !== 'session') {
      throw new Error(`Invalid session node type: ${JSON.stringify((node as { type: unknown }).type)}`);
    }
  }
}

/** filename.ext -> filename (1).ext, filename (2).ext ... 중 없는 첫 경로 */
async function uniquePath(target: string): Promise<string> {
  const dir = path.dirname(target);
  const ext = path.extname(target);
  const base = path.basename(target, ext);

  for (let n = 1; ; n++) {
    const candidate = path.join(dir, `${base} (${n})${ext}`);
    if (!(await fs.promises.lstat(candidate).catch(() => null))) return candidate;
  }
}
