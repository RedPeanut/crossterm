import path from 'path';
import { Queue } from '../../common/base/async';
import { Emitter, Event } from '../../common/base/event';
import { Disposable } from '../../common/base/lifecycle';
import { EnvironmentService } from '../../common/service/EnvironmentService';
import { FileService } from '../../common/service/FileService';
import { UserKeybindingEntry, UserKeybindingsService, sanitizeUserKeybindings } from '../../common/service/UserKeybindingsService';

/**
 * `userData/keybindings.json` 을 읽고 쓴다.
 * 구조는 MainConfigurationService 와 같다. (쓰기 큐 직렬화 + 원자적 저장)
 */
export class MainUserKeybindingsService extends Disposable implements UserKeybindingsService {

  private readonly _onDidChange = this._register(new Emitter<void>());
  readonly onDidChange: Event<void> = this._onDidChange.event;

  /** 쓰기 직렬화 큐 */
  private readonly writeQueue = new Queue();

  private readonly keybindingsPath: string;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly fileService: FileService,
  ) {
    super();
    this.keybindingsPath = path.join(this.environmentService.userDataPath, 'keybindings.json');
  }

  async getKeybindings(): Promise<UserKeybindingEntry[]> {
    // 진행 중인 쓰기가 끝난 뒤에 읽어야 방금 저장한 값이 보인다.
    return this.writeQueue.queue(() => this.load());
  }

  async setKeybindings(entries: readonly UserKeybindingEntry[]): Promise<void> {
    const sanitized = sanitizeUserKeybindings(entries);
    const changed = await this.writeQueue.queue(async () => {
      const previous = await this.load();
      if (JSON.stringify(previous) === JSON.stringify(sanitized)) {
        return false;
      }
      await this.fileService.writeFileAtomic(this.keybindingsPath, JSON.stringify(sanitized, null, 2), { encoding: 'utf8' });
      return true;
    });
    if (changed) {
      this._onDidChange.fire();
    }
  }

  private async load(): Promise<UserKeybindingEntry[]> {
    let content: string;
    try {
      content = (await this.fileService.readFile(this.keybindingsPath, {})).toString().trim();
    } catch {
      return []; // 파일이 없으면 사용자 키바인딩 없음
    }
    if (!content) {
      return [];
    }
    try {
      return sanitizeUserKeybindings(JSON.parse(content));
    } catch (err) {
      console.warn(`[keybindings] cannot parse ${this.keybindingsPath}`, err);
      return [];
    }
  }
}
