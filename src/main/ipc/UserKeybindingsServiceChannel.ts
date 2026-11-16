import { MainEvents } from '../../common/ipc';
import { UserKeybindingEntry, UserKeybindingsService } from '../../common/service/UserKeybindingsService';
import { IpcChannel, IpcHandler } from '../IpcChannel';

export class UserKeybindingsServiceChannel implements IpcChannel {

  readonly handlers: ReadonlyMap<MainEvents, IpcHandler>;

  constructor(private readonly userKeybindingsService: UserKeybindingsService) {
    this.handlers = new Map<MainEvents, IpcHandler>([
      ['keybindings get', () =>
        this.userKeybindingsService.getKeybindings()],
      ['keybindings set', (entries: UserKeybindingEntry[]) =>
        this.userKeybindingsService.setKeybindings(entries)],
    ]);
  }
}
