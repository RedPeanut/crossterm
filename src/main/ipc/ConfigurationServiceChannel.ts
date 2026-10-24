import { MainEvents } from '../../common/ipc';
import { ConfigurationService } from '../../common/service/ConfigurationService';
import { IpcChannel, IpcHandler } from '../IpcChannel';

export class ConfigurationServiceChannel implements IpcChannel {

  readonly handlers: ReadonlyMap<MainEvents, IpcHandler>;

  constructor(private readonly configurationService: ConfigurationService) {
    this.handlers = new Map<MainEvents, IpcHandler>([
      ['configuration get value', (section?: string) =>
        this.configurationService.getValue(section)],
      ['configuration update value', (key: string, value: unknown) =>
        this.configurationService.updateValue(key, value)],
      ['configuration keys', () =>
        this.configurationService.keys()],
    ]);
  }
}
