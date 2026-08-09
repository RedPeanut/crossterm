import { Disposable } from "../../common/base/lifecycle";
import { Emitter, Event } from "../../common/base/event";
import { ConfigurationChangeEvent, ConfigurationService } from "../../common/service/ConfigurationService";

export class RenderConfigurationService extends Disposable implements ConfigurationService {

  private readonly _onDidChangeConfiguration = new Emitter<ConfigurationChangeEvent>();
  readonly onDidChangeConfiguration: Event<ConfigurationChangeEvent> = this._onDidChangeConfiguration.event;

  constructor() {
    super();
    window.ipc.on('configuration changed', (_event: unknown, change: ConfigurationChangeEvent) => {
      this._onDidChangeConfiguration.fire(change);
    });
  }

  init(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  // getValue<T>(): T;
  // getValue<T>(section: string): T {
  async getValue<T>(section?: string): Promise<T> {
    // throw new Error("Method not implemented.");
    return await window.ipc.invoke('configuration get value', [section]);
  }

  async updateValue(key: string, value: unknown): Promise<void> {
    // throw new Error("Method not implemented.");
    await window.ipc.invoke('configuration update value', [key, value]);
  }

  async keys(): Promise<string[]> {
    // throw new Error("Method not implemented.");
    return await window.ipc.invoke('configuration keys', []);
  }

}