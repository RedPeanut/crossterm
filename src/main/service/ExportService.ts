import path from 'path';
import { FileService } from '../../common/service/FileService';
import { EnvironmentService } from '../../common/service/EnvironmentService';
import { StorageService } from '../../common/service/StorageService';
import { AppService } from './AppService';

export const EXPORT_FORMAT = 'crossterm-export';
export const EXPORT_VERSION = 1;

/**
 * 세션 트리 노드.
 * 세션 파일 내용은 가공 없이 data 에 넣고, JSON 이 아니면 원문을 raw 에 넣는다.
 */
export type ExportedSessionNode =
  | { name: string, type: 'folder', children: ExportedSessionNode[] }
  | { name: string, type: 'session', data?: unknown, raw?: string };

export interface ExportedData {
  format: typeof EXPORT_FORMAT;
  version: number;
  exportedAt: string;
  appVersion: string;
  /** user/sessions 폴더 트리 */
  sessions: ExportedSessionNode[];
  /** settings.json (사용자 설정). 파일이 없으면 null, JSON 이 아니면 원문 문자열 */
  settings: unknown;
  // /** state.sqldb 의 ItemTable (key -> value 원문) */
  // state: Record<string, string>;
}

/**
 * 내보내기.
 * 세션 폴더, 설정 파일, 앱 상태(sqlite)를 하나의 JSON 파일로 묶는다.
 */
export class ExportService {

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly fileService: FileService,
    private readonly storageService: StorageService,
    private readonly appService: AppService,
    private readonly appVersion: string,
  ) {}

  /** @returns 결과창에 표시할 로그 */
  async exportTo(filePath: string): Promise<string[]> {
    const log: string[] = [];

    log.push('Exporting sessions...');
    const sessions = await this.readSessions(this.appService.getSessionsDir(), log);

    log.push('', 'Exporting settings...');
    const settings = await this.readSettings(log);

    // log.push('', 'Exporting app state...');
    // const state = await this.readState(log);

    const data: ExportedData = {
      format: EXPORT_FORMAT,
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      appVersion: this.appVersion,
      sessions,
      settings,
      // state,
    };
    await this.fileService.writeFileAtomic(filePath, JSON.stringify(data, null, 2) + '\n');

    log.push('', `Saved to ${filePath}`);
    return log;
  }

  private async readSessions(dir: string, log: string[]): Promise<ExportedSessionNode[]> {
    if (!(await this.fileService.exists(dir))) return [];

    const filters = this.appService.ignoreFileFolder.split(',');
    const folders: ExportedSessionNode[] = [], sessions: ExportedSessionNode[] = [];

    for (const item of await this.fileService.readdirWithStat(dir)) {
      if (filters.includes(item.name)) continue;
      const itemPath = path.join(dir, item.name);

      if (item.isDirectory) {
        folders.push({ name: item.name, type: 'folder', children: await this.readSessions(itemPath, log) });
      } else if (item.isFile) {
        const text = (await this.fileService.readFile(itemPath)).toString('utf8');
        log.push(itemPath);
        try {
          sessions.push({ name: item.name, type: 'session', data: JSON.parse(text) });
        } catch {
          sessions.push({ name: item.name, type: 'session', raw: text });
          log.push('  warning: invalid JSON, exported as raw text');
        }
      }
      // 심볼릭 링크 등은 건너뛴다
    }

    // AppService.readdir 과 같은 순서 (폴더 먼저, 이름순)
    const byName = (a: ExportedSessionNode, b: ExportedSessionNode) => a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
    return [...folders.sort(byName), ...sessions.sort(byName)];
  }

  private async readSettings(log: string[]): Promise<unknown> {
    const settingsPath = path.join(this.environmentService.userDataPath, 'settings.json');
    if (!(await this.fileService.exists(settingsPath))) {
      log.push('  (no settings.json)');
      return null;
    }

    const text = (await this.fileService.readFile(settingsPath)).toString('utf8');
    log.push(settingsPath);
    try {
      return JSON.parse(text);
    } catch {
      log.push('  warning: invalid JSON, exported as raw text');
      return text;
    }
  }

  private async readState(log: string[]): Promise<Record<string, string>> {
    const rows = await this.storageService.getall() as { key: string, value: string }[];
    const state: Record<string, string> = {};
    for (const { key, value } of rows) state[key] = value;

    log.push(path.join(this.environmentService.userDataPath, 'user', 'state.sqldb'));
    for (const key of Object.keys(state)) log.push(`  ${key}`);
    return state;
  }
}
