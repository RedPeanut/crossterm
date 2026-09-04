import { Emitter, Event } from '../../common/base/event';
import { Disposable, IDisposable } from '../../common/base/lifecycle';
import { Context, ContextKey, ContextKeyExpression, ContextKeyValue } from '../key/ContextKey';

/**
 * VSCode의 `vs/platform/contextkey/browser/contextKeyService.ts`를 최소 형태로 옮긴 것.
 *
 * 구조:
 *  - 모든 Context는 하나의 registry(root가 소유)에 id로 등록된다.
 *  - scoped 서비스는 DOM 노드에 `data-keybinding-context="<id>"`를 심는다.
 *    키 입력이 오면 event.target에서 위로 올라가며 가장 가까운 Context를 찾으므로,
 *    "포커스된 위치에 따라 when 절 판정이 달라지는" 동작이 여기서 나온다.
 *
 * 원본과 비교해 의도적으로 뺀 것:
 *  - config.* 키 자동 노출(ConfigAwareContextValuesContainer)
 *  - overlay context, updateParent, 변경 이벤트 버퍼링(bufferChangeEvents)
 */

export const KEYBINDING_CONTEXT_ATTR = 'data-keybinding-context';

/** DOM 노드에서 필요한 최소 인터페이스(테스트에서 가짜 노드를 넣기 쉽게 하기 위함). */
export interface ContextKeyServiceTarget {
  parentElement: ContextKeyServiceTarget | null;
  getAttribute(attr: string): string | null;
  setAttribute(attr: string, value: string): void;
  removeAttribute(attr: string): void;
}

export interface ContextKeyChangeEvent {
  affectsSome(keys: ReadonlySet<string>): boolean;
}

/** key -> value 저장소. 없는 key는 부모 체인을 따라 조회한다. */
class ContextValueContainer implements Context {
  private readonly _value = new Map<string, ContextKeyValue>();

  constructor(readonly id: number, private readonly _parent: ContextValueContainer | undefined) { }

  /** @returns 실제로 값이 바뀌었는지 */
  setValue(key: string, value: ContextKeyValue): boolean {
    if (this._value.has(key) && this._value.get(key) === value) {
      return false;
    }
    this._value.set(key, value);
    return true;
  }

  removeValue(key: string): boolean {
    return this._value.delete(key);
  }

  getValue<T extends ContextKeyValue>(key: string): T | undefined {
    if (this._value.has(key)) {
      return this._value.get(key) as T;
    }
    return this._parent?.getValue<T>(key);
  }
}

/**
 * context id는 registry 단위가 아니라 전역에서 유일해야 한다.
 * DOM에 심긴 `data-keybinding-context` 값을 다른 registry가 자기 것으로 오독하는 것을 막는다.
 * (앱에는 root가 하나뿐이지만, 테스트나 보조 창처럼 root가 둘 이상이면 실제로 충돌한다)
 */
let lastContextId = 0;

/** root ContextKeyService가 소유하고, 모든 scoped 서비스가 공유한다. */
class ContextRegistry implements IDisposable {
  readonly contexts = new Map<number, ContextValueContainer>();
  readonly onDidChange = new Emitter<ContextKeyChangeEvent>();

  createContext(parentId: number | undefined): number {
    const id = ++lastContextId;
    const parent = parentId === undefined ? undefined : this.contexts.get(parentId);
    this.contexts.set(id, new ContextValueContainer(id, parent));
    return id;
  }

  disposeContext(id: number): void {
    this.contexts.delete(id);
  }

  fireChange(keys: string[]): void {
    const changed = new Set(keys);
    this.onDidChange.fire({ affectsSome: other => [...other].some(key => changed.has(key)) });
  }

  dispose(): void {
    this.onDidChange.dispose();
    this.contexts.clear();
  }
}

class ContextKeyImpl<T extends ContextKeyValue> implements ContextKey<T> {
  constructor(
    private readonly _service: ContextKeyService,
    private readonly _key: string,
    private readonly _defaultValue: T | undefined
  ) {
    this.reset();
  }

  set(value: T): void {
    this._service.setContext(this._key, value);
  }

  reset(): void {
    if (this._defaultValue === undefined) {
      this._service.removeContext(this._key);
    } else {
      this._service.setContext(this._key, this._defaultValue);
    }
  }

  get(): T | undefined {
    return this._service.getContextKeyValue<T>(this._key);
  }
}

export class ContextKeyService extends Disposable {
  private readonly _registry: ContextRegistry;
  private readonly _contextId: number;
  private readonly _domNode: ContextKeyServiceTarget | undefined;
  private readonly _isRoot: boolean;

  readonly onDidChangeContext: Event<ContextKeyChangeEvent>;

  /** root는 인자 없이 생성한다. scoped 서비스는 `createScoped()`로만 만든다. */
  constructor(registry?: ContextRegistry, parentContextId?: number, domNode?: ContextKeyServiceTarget) {
    super();
    this._isRoot = !registry;
    this._registry = registry ?? this._register(new ContextRegistry());
    this._contextId = this._registry.createContext(parentContextId);
    this._domNode = domNode;
    this.onDidChangeContext = this._registry.onDidChange.event;

    this._domNode?.setAttribute(KEYBINDING_CONTEXT_ATTR, String(this._contextId));
  }

  /** 컴포넌트가 자기 상태를 노출할 때 사용. 예: `ctxKeys.createKey('paneFocused', false)` */
  createKey<T extends ContextKeyValue>(key: string, defaultValue: T | undefined): ContextKey<T> {
    return new ContextKeyImpl(this, key, defaultValue);
  }

  setContext(key: string, value: ContextKeyValue): void {
    if (this._registry.contexts.get(this._contextId)?.setValue(key, value)) {
      this._registry.fireChange([key]);
    }
  }

  removeContext(key: string): void {
    if (this._registry.contexts.get(this._contextId)?.removeValue(key)) {
      this._registry.fireChange([key]);
    }
  }

  getContextKeyValue<T extends ContextKeyValue>(key: string): T | undefined {
    return this._registry.contexts.get(this._contextId)?.getValue<T>(key);
  }

  /**
   * `target`(보통 `document.activeElement` 또는 keydown 이벤트의 target)에서
   * 위로 올라가며 가장 가까운 Context를 찾는다. 못 찾으면 이 서비스의 Context.
   */
  getContext(target?: ContextKeyServiceTarget | null): Context {
    let node = target ?? null;
    while (node) {
      const rawId = node.getAttribute(KEYBINDING_CONTEXT_ATTR);
      if (rawId) {
        const context = this._registry.contexts.get(parseInt(rawId, 10));
        if (context) {
          return context;
        }
      }
      node = node.parentElement;
    }
    return this._registry.contexts.get(this._contextId)!;
  }

  contextMatchesRules(rules: ContextKeyExpression | undefined, target?: ContextKeyServiceTarget | null): boolean {
    return rules ? rules.evaluate(this.getContext(target)) : true;
  }

  /** DOM 노드 하위에서만 유효한 자식 Context를 만든다. 반환값을 dispose하면 정리된다. */
  createScoped(domNode: ContextKeyServiceTarget): ContextKeyService {
    return new ContextKeyService(this._registry, this._contextId, domNode);
  }

  override dispose(): void {
    if (!this._isRoot) {
      this._domNode?.removeAttribute(KEYBINDING_CONTEXT_ATTR);
      this._registry.disposeContext(this._contextId);
    }
    super.dispose();
  }
}
