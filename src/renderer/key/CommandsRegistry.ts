import { IDisposable } from "../../common/base/lifecycle";

/**
 * VSCode의 `vs/platform/commands/common/commands.ts`를 최소 형태로 옮긴 것.
 * 키바인딩은 커맨드 id만 알고, 실제 동작은 여기 등록된 핸들러가 수행한다.
 * (키 입력 -> 커맨드 id -> 핸들러 로 분리되는 것이 이 프레임워크의 핵심)
 */
export type CommandHandler = (...args: unknown[]) => unknown;

export interface Command {
  readonly id: string;
  readonly handler: CommandHandler;
  /**
   * 단축키 편집창 등에 보이는 이름.
   * 함수로 두어 꺼낼 때 번역한다. (등록 시점에는 아직 setLocale 전일 수 있다)
   */
  readonly title?: () => string;
}

class CommandsRegistryImpl {
  private readonly _commands = new Map<string, Command>();

  registerCommand(id: string, handler: CommandHandler, title?: () => string): IDisposable {
    this._commands.set(id, { id, handler, title });
    return { dispose: () => this._commands.delete(id) };
  }

  getCommand(id: string): Command | undefined {
    return this._commands.get(id);
  }

  /** 커맨드의 표시 이름. 제목이 없거나 등록되지 않은 커맨드면 id를 그대로 돌려준다. */
  getCommandTitle(id: string): string {
    return this._commands.get(id)?.title?.() ?? id;
  }

  getCommands(): ReadonlyMap<string, Command> {
    return this._commands;
  }
}

export const commandsRegistry = new CommandsRegistryImpl();