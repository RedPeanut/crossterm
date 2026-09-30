import { Emitter, Event } from '../../common/base/event';
import { Disposable } from '../../common/base/lifecycle';
import { wrapper } from '../globals';
import { Service } from '../Service';
import { collectVisibleItems } from '../utils';

/**
 * 입력 브로드캐스트(iTerm2의 Broadcast Input).
 */
export interface BroadcastInputService extends Service {
  readonly onDidChange: Event<void>;
  readonly size: number;
  readonly visible: boolean;

  has(uid: string): boolean;
  targetsFor(sourceUid: string): string[];
  toggleVisible(): void;
  toggleTerminal(uid: string): void;
  remove(uid: string): void;
}

export class BroadcastInputServiceImpl extends Disposable implements BroadcastInputService {

  private readonly _targets = new Set<string>();
  private _visible: boolean = false;

  private readonly _onDidChange = this._register(new Emitter<void>());
  readonly onDidChange: Event<void> = this._onDidChange.event;

  get size(): number { return this._targets.size; }
  get visible(): boolean { return this._visible; }

  has(uid: string): boolean { return this._targets.has(uid); }

  /**
   * 송신자가 집합에 속해 있을 때만 퍼뜨린다.
   * 방송 그룹 밖의 터미널에 타이핑하면 그 터미널에만 간다 (iTerm2와 같은 의미론).
   */
  targetsFor(sourceUid: string): string[] {
    return this._targets.has(sourceUid) ? [...this._targets] : [sourceUid];
  }

  toggleVisible(): void {
    this._visible = !this._visible;

    if (!this.visible) {
      this._targets.clear();
    } else {
      for (const item of collectVisibleItems(wrapper.tree)) {
        if (item.term) this._targets.add(item.term.uid);
      }
    }
    this._onDidChange.fire();
  }

  toggleTerminal(uid: string): void {
    if (!this._targets.delete(uid)) {
      this._targets.add(uid);
    }
    this._onDidChange.fire();
  }

  remove(uid: string): void {
    if (this._targets.delete(uid)) {
      this._onDidChange.fire();
    }
  }
}
