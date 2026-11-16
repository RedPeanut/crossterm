import { Emitter, Event } from '../../common/base/event';
import { Disposable } from '../../common/base/lifecycle';
import { UserKeybindingEntry, UserKeybindingsService } from '../../common/service/UserKeybindingsService';

/** main 의 MainUserKeybindingsService 를 IPC 로 감싼 것. */
export class RenderUserKeybindingsService extends Disposable implements UserKeybindingsService {

  private readonly _onDidChange = this._register(new Emitter<void>());
  readonly onDidChange: Event<void> = this._onDidChange.event;

  constructor() {
    super();
    this._register(window.ipc.on('keybindings changed', () => this._onDidChange.fire()));
  }

  async getKeybindings(): Promise<UserKeybindingEntry[]> {
    return await window.ipc.invoke('keybindings get');
  }

  async setKeybindings(entries: readonly UserKeybindingEntry[]): Promise<void> {
    await window.ipc.invoke('keybindings set', entries);
  }
}
