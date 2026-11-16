import { Emitter, Event } from '../../common/base/event';
import { Disposable, IDisposable } from '../../common/base/lifecycle';
import { CommandService } from './CommandService';
import { commandsRegistry } from '../key/CommandsRegistry';
import { ContextKeyService, ContextKeyServiceTarget } from './ContextKeyService';
import { Chord, toElectronAccelerator } from '../key/Keybinding';
import { KeybindingResolver, ResultKind } from '../key/KeybindingResolver';
import { ResolvedKeybindingItem, fromUserKeybindingEntries, keybindingsRegistry } from '../key/KeybindingsRegistry';
import { UserKeybindingEntry } from '../../common/service/UserKeybindingsService';
// import { keybindingsRegistry } from '../globals';

/**
 * VSCode의 `vs/platform/keybinding/common/abstractKeybindingService.ts` +
 * `vs/workbench/services/keybinding/browser/keybindingService.ts`를 최소 형태로 합친 것.
 *
 * 흐름:
 *   keydown -> Chord 생성 -> dispatch 문자열 -> (event.target 기준 Context) -> resolver
 *     -> NoMatchingKb: 브라우저/터미널에 그대로 흘려보냄
 *     -> MoreChordsNeeded: chord 모드 진입, preventDefault
 *     -> KbFound: 커맨드 실행, preventDefault
 *
 * 원본과 비교해 의도적으로 뺀 것:
 *  - single modifier chord(`shift shift`), keybinding hold mode
 *  - `bubble`(^prefix) 처리, 텔레메트리, 키보드 레이아웃 서비스
 */

/** chord 모드에서 다음 입력을 기다리는 시간(ms). VSCode와 동일. */
const CHORD_TIMEOUT = 5000;

export interface ChordModeEvent {
  /** chord 모드가 아니면 undefined. 예: `'⌘K'` */
  readonly label: string | undefined;
}

/** 단축키 편집창의 한 줄. 키바인딩이 없는 커맨드도 `keybinding: undefined`로 한 줄을 차지한다. */
export interface KeybindingListItem {
  readonly command: string;
  /** 표시 이름. 제목이 없으면 커맨드 id. */
  readonly title: string;
  readonly keybinding: ResolvedKeybindingItem | undefined;
}

export class KeybindingService extends Disposable {
  private _resolver: KeybindingResolver | undefined;
  private _userKeybindings: ResolvedKeybindingItem[] = [];

  private _currentChords: { keypress: string; label: string }[] = [];
  private _currentChordTimeout: ReturnType<typeof setTimeout> | undefined;

  private readonly _onDidChangeChordMode = this._register(new Emitter<ChordModeEvent>());
  /** 상태바에 "(⌘K) 를 눌렀습니다..." 같은 표시를 하고 싶을 때 구독한다. */
  readonly onDidChangeChordMode: Event<ChordModeEvent> = this._onDidChangeChordMode.event;

  private readonly _onDidUpdateKeybindings = this._register(new Emitter<void>());
  /** 사용자 키바인딩이 바뀌면 발생한다. 메뉴바 단축키 표시, 단축키 편집창이 다시 그릴 때 구독한다. */
  readonly onDidUpdateKeybindings: Event<void> = this._onDidUpdateKeybindings.event;

  /** 0보다 크면 키 입력을 커맨드로 보내지 않는다. (suspendDispatch) */
  private _suspendCount = 0;

  constructor(
    private readonly _contextKeyService: ContextKeyService,
    private readonly _commandService: CommandService
  ) {
    super();
  }

  /** 보통 `window`에 붙인다. keydown을 capture 단계에서 가로채 커맨드를 먼저 처리한다. */
  attach(target: Window | HTMLElement): IDisposable {
    const listener = ((e: KeyboardEvent): void => {
      if (this.dispatchEvent(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }) as EventListener;
    target.addEventListener('keydown', listener, /* capture */ true);
    return { dispose: () => target.removeEventListener('keydown', listener, true) };
  }

  /** 사용자 키바인딩(keybindings.json 내용) 교체. 기본 바인딩보다 우선하며, `-command` 제거 룰도 여기서 받는다. */
  setUserKeybindings(entries: readonly UserKeybindingEntry[]): void {
    this._userKeybindings = fromUserKeybindingEntries(entries);
    this._resolver = undefined;
    this._onDidUpdateKeybindings.fire();
  }

  /**
   * 반환한 disposable 을 dispose 할 때까지 키 입력을 커맨드로 보내지 않는다.
   * 단축키 편집창이 키를 녹화하는 동안 `mod+c` 같은 키가 커맨드로 실행되지 않고 입력창까지 가도록 할 때 쓴다.
   * 여러 곳에서 동시에 걸 수 있고, 모두 풀려야 다시 동작한다.
   */
  suspendDispatch(): IDisposable {
    this._suspendCount++;
    this._leaveChordMode();
    let disposed = false;
    return {
      dispose: () => {
        if (!disposed) {
          disposed = true;
          this._suspendCount--;
        }
      },
    };
  }

  /**
   * 단축키 편집창 목록. 제거 룰까지 반영한 최종 키바인딩 한 개당 한 줄이고,
   * 등록됐지만 키바인딩이 없는 커맨드도 한 줄씩 들어간다. 정렬은 하지 않는다(커맨드 등록 순서).
   */
  getKeybindingListItems(): KeybindingListItem[] {
    const byCommand = new Map<string, ResolvedKeybindingItem[]>();
    for (const keybinding of this.resolver.getKeybindings()) {
      byCommand.set(keybinding.command, [...(byCommand.get(keybinding.command) ?? []), keybinding]);
    }
    // 등록된 커맨드 먼저, 그다음 keybindings.json 에만 있는 커맨드(오타 등)
    const commands = new Set([...commandsRegistry.getCommands().keys(), ...byCommand.keys()]);

    const items: KeybindingListItem[] = [];
    for (const command of commands) {
      const title = commandsRegistry.getCommandTitle(command);
      const keybindings = byCommand.get(command) ?? [];
      if (keybindings.length === 0) {
        items.push({ command, title, keybinding: undefined });
      }
      for (const keybinding of keybindings) {
        items.push({ command, title, keybinding });
      }
    }
    return items;
  }

  get inChordMode(): boolean {
    return this._currentChords.length > 0;
  }

  /** @returns preventDefault 해야 하는지 */
  dispatchEvent(e: KeyboardEvent): boolean {
    if (this._suspendCount > 0) {
      return false;
    }
    const chord = Chord.fromKeyboardEvent(e);
    const keypress = chord?.toDispatchString();
    if (!chord || !keypress) {
      return false; // 알 수 없는 키 또는 수식 키 단독
    }

    const target = (e.target as unknown as ContextKeyServiceTarget | null) ?? null;
    const context = this._contextKeyService.getContext(target);
    const currentChords = this._currentChords.map(c => c.keypress);
    const result = this.resolver.resolve(context, currentChords, keypress);

    switch (result.kind) {
      case ResultKind.NoMatchingKb: {
        if (this.inChordMode) {
          // chord 모드였다면 잘못 누른 것이므로 소비하고 빠져나온다.
          this._leaveChordMode();
          return true;
        }
        return false;
      }

      case ResultKind.MoreChordsNeeded: {
        this._enterChordMode(keypress, chord.toLabel());
        return true;
      }

      case ResultKind.KbFound: {
        this._leaveChordMode();
        void this._commandService
          .executeCommand(result.commandId, ...(result.commandArgs === undefined ? [] : [result.commandArgs]))
          .catch (err => console.error(`[keybinding] command '${result.commandId}' failed`, err));
        return true;
      }
    }
  }

  /** 메뉴/툴팁에 단축키를 표시할 때 사용. 예: `'⇧⌘P'` */
  lookupKeybindingLabel(commandId: string): string | undefined {
    const item = this.resolver.lookupPrimaryKeybinding(commandId, this._contextKeyService.getContext());
    return item ? item.label : undefined;
  }

  /** Electron 메뉴(컨텍스트 메뉴 포함)의 accelerator 로 표시할 때 사용. 예: `'Cmd+X'` */
  lookupKeybindingAccelerator(commandId: string): string | undefined {
    const item = this.resolver.lookupPrimaryKeybinding(commandId, this._contextKeyService.getContext());
    return item ? toElectronAccelerator(item.chords) : undefined;
  }

  private get resolver(): KeybindingResolver {
    if (!this._resolver) {
      this._resolver = new KeybindingResolver(keybindingsRegistry.getDefaultKeybindings(), this._userKeybindings);
    }
    return this._resolver;
  }

  private _enterChordMode(keypress: string, label: string): void {
    this._currentChords.push({ keypress, label });
    this._scheduleChordTimeout();
    this._onDidChangeChordMode.fire({ label: this._currentChords.map(c => c.label).join(' ') });
  }

  private _leaveChordMode(): void {
    if (!this.inChordMode) {
      return;
    }
    this._clearChordTimeout();
    this._currentChords = [];
    this._onDidChangeChordMode.fire({ label: undefined });
  }

  private _scheduleChordTimeout(): void {
    this._clearChordTimeout();
    this._currentChordTimeout = setTimeout(() => this._leaveChordMode(), CHORD_TIMEOUT);
  }

  private _clearChordTimeout(): void {
    if (this._currentChordTimeout !== undefined) {
      clearTimeout(this._currentChordTimeout);
      this._currentChordTimeout = undefined;
    }
  }

  override dispose(): void {
    this._clearChordTimeout();
    super.dispose();
  }
}
