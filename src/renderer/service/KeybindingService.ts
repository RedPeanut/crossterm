import { Emitter, Event } from '../../common/base/event';
import { Disposable, IDisposable } from '../../common/base/lifecycle';
import { CommandService } from './CommandService';
import { ContextKeyService, ContextKeyServiceTarget } from './ContextKeyService';
import { Chord } from '../key/Keybinding';
import { KeybindingResolver, ResultKind } from '../key/KeybindingResolver';
import { KeybindingRule, ResolvedKeybindingItem, toUserKeybindingItems } from '../key/KeybindingsRegistry';
import { keybindingsRegistry } from '../globals';

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

export class KeybindingService extends Disposable {
  private _resolver: KeybindingResolver | undefined;
  private _userKeybindings: ResolvedKeybindingItem[] = [];

  private _currentChords: { keypress: string; label: string }[] = [];
  private _currentChordTimeout: ReturnType<typeof setTimeout> | undefined;

  private readonly _onDidChangeChordMode = this._register(new Emitter<ChordModeEvent>());
  /** 상태바에 "(⌘K) 를 눌렀습니다..." 같은 표시를 하고 싶을 때 구독한다. */
  readonly onDidChangeChordMode: Event<ChordModeEvent> = this._onDidChangeChordMode.event;

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

  /** 사용자 설정 키바인딩 교체. 기본 바인딩보다 우선한다. */
  setUserKeybindings(rules: KeybindingRule[]): void {
    this._userKeybindings = toUserKeybindingItems(rules);
    this._resolver = undefined;
  }

  get inChordMode(): boolean {
    return this._currentChords.length > 0;
  }

  /** @returns preventDefault 해야 하는지 */
  dispatchEvent(e: KeyboardEvent): boolean {
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
          .catch(err => console.error(`[keybinding] command '${result.commandId}' failed`, err));
        return true;
      }
    }
  }

  /** 메뉴/툴팁에 단축키를 표시할 때 사용. 예: `'⇧⌘P'` */
  lookupKeybindingLabel(commandId: string): string | undefined {
    return this.resolver.lookupPrimaryKeybinding(commandId, this._contextKeyService.getContext())?.label;
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
