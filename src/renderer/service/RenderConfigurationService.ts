import { Event } from "../../common/base/event";
import { ConfigurationChangeEvent, ConfigurationService } from "../../common/service/ConfigurationService";

export class RenderConfigurationService implements ConfigurationService {

  onDidChangeConfiguration: Event<ConfigurationChangeEvent>;

  init(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  // getValue<T>(): T;
  getValue<T>(section?: string): T {
    throw new Error("Method not implemented.");
  }

  updateValue(key: string, value: unknown): Promise<void> {
    throw new Error("Method not implemented.");
  }

  keys(): string[] {
    throw new Error("Method not implemented.");
  }

}