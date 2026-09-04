import { IDisposable } from '../../common/base/lifecycle';
import { commandsRegistry } from '../globals';

/**
 * VSCode의 `vs/platform/commands/common/commands.ts`를 최소 형태로 옮긴 것.
 * 키바인딩은 커맨드 id만 알고, 실제 동작은 여기 등록된 핸들러가 수행한다.
 * (키 입력 -> 커맨드 id -> 핸들러 로 분리되는 것이 이 프레임워크의 핵심)
 */

export type CommandHandler = (...args: unknown[]) => unknown;

export interface Command {
  readonly id: string;
  readonly handler: CommandHandler;
}

export class CommandsRegistryImpl {
  private readonly _commands = new Map<string, Command>();

  registerCommand(id: string, handler: CommandHandler): IDisposable {
    this._commands.set(id, { id, handler });
    return { dispose: () => this._commands.delete(id) };
  }

  getCommand(id: string): Command | undefined {
    return this._commands.get(id);
  }

  getCommands(): ReadonlyMap<string, Command> {
    return this._commands;
  }
}

export class CommandService {
  async executeCommand<T = unknown>(id: string, ...args: unknown[]): Promise<T | undefined> {
    const command = commandsRegistry.getCommand(id);
    if (!command) {
      throw new Error(`command '${id}' not found`);
    }
    return await command.handler(...args) as T;
  }
}
