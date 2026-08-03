import { MainEvents } from '../../common/ipc';
import { ConfigurationService } from '../../common/service/ConfigurationService';
import { IpcChannel, IpcHandler } from '../IpcChannel';

export class ConfigurationServiceChannel implements IpcChannel {

  readonly handlers: ReadonlyMap<MainEvents, IpcHandler>;

  constructor(private readonly configurationService: ConfigurationService) {
    this.handlers = new Map<MainEvents, IpcHandler>([
      ['configuration get value', (_, section) =>
        this.configurationService.getValue(section)],
      ['configuration update value', (_, key: string, value: string) =>
        this.configurationService.updateValue(key, value)],
      ['configuration keys', (_) =>
        this.configurationService.keys()],
    ]);
  }
}
