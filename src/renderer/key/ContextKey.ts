/**
 * VSCode의 `vs/platform/contextkey/common/contextkey.ts`를 최소 형태로 옮긴 것.
 *
 * 핵심 개념:
 *  - Context: key -> value 저장소. 부모 Context를 가질 수 있다(스코프 체인).
 *  - ContextKeyExpression: `when` 절을 표현하는 식(expression) 트리. `evaluate(context)`로 판정한다.
 *
 * 원본과 비교해 의도적으로 뺀 것:
 *  - 괄호/우선순위를 지원하는 정식 파서(scanner.ts) -> `||`, `&&` 분할 파서로 대체
 *  - `in`, `not in`, greater/less, 상수 치환(substituteConstants), implies/negate 최적화
 */

export type ContextKeyValue =
  | null
  | undefined
  | boolean
  | number
  | string
  | Array<null | undefined | boolean | number | string>
  | Record<string, null | undefined | boolean | number | string>;

/** 식(expression)을 평가할 때 값을 조회하는 대상. */
export interface Context {
  getValue<T extends ContextKeyValue = ContextKeyValue>(key: string): T | undefined;
}

/** 컴포넌트가 자기 상태를 context에 밀어넣을 때 쓰는 핸들. */
export interface ContextKey<T extends ContextKeyValue = ContextKeyValue> {
  set(value: T): void;
  reset(): void;
  get(): T | undefined;
}

export const enum ContextKeyExprType {
  False = 0,
  True = 1,
  Defined = 2,
  Not = 3,
  Equals = 4,
  NotEquals = 5,
  Regex = 6,
  And = 7,
  Or = 8,
}

export interface ContextKeyExpression {
  readonly type: ContextKeyExprType;
  evaluate(context: Context): boolean;
  serialize(): string;
  /** 이 식이 참조하는 모든 key. context 변경 이벤트 필터링에 쓴다. */
  keys(): string[];
}

class TrueExpr implements ContextKeyExpression {
  static readonly INSTANCE = new TrueExpr();
  readonly type = ContextKeyExprType.True;
  evaluate(): boolean { return true; }
  serialize(): string { return 'true'; }
  keys(): string[] { return []; }
}

class FalseExpr implements ContextKeyExpression {
  static readonly INSTANCE = new FalseExpr();
  readonly type = ContextKeyExprType.False;
  evaluate(): boolean { return false; }
  serialize(): string { return 'false'; }
  keys(): string[] { return []; }
}

/** `myKey` — truthy 여부만 본다. */
class DefinedExpr implements ContextKeyExpression {
  readonly type = ContextKeyExprType.Defined;
  constructor(readonly key: string) { }
  evaluate(context: Context): boolean { return !!context.getValue(this.key); }
  serialize(): string { return this.key; }
  keys(): string[] { return [this.key]; }
}

/** `!myKey` */
class NotExpr implements ContextKeyExpression {
  readonly type = ContextKeyExprType.Not;
  constructor(readonly key: string) { }
  evaluate(context: Context): boolean { return !context.getValue(this.key); }
  serialize(): string { return `!${this.key}`; }
  keys(): string[] { return [this.key]; }
}

/** `myKey == 'value'` — VSCode와 동일하게 문자열로 정규화 후 비교한다. */
class EqualsExpr implements ContextKeyExpression {
  readonly type = ContextKeyExprType.Equals;
  constructor(readonly key: string, readonly value: unknown) { }
  evaluate(context: Context): boolean {
    /* eslint-disable-next-line eqeqeq */
    return String(context.getValue(this.key)) === String(this.value);
  }
  serialize(): string { return `${this.key} == '${this.value}'`; }
  keys(): string[] { return [this.key]; }
}

/** `myKey != 'value'` */
class NotEqualsExpr implements ContextKeyExpression {
  readonly type = ContextKeyExprType.NotEquals;
  constructor(readonly key: string, readonly value: unknown) { }
  evaluate(context: Context): boolean {
    return String(context.getValue(this.key)) !== String(this.value);
  }
  serialize(): string { return `${this.key} != '${this.value}'`; }
  keys(): string[] { return [this.key]; }
}

/** `myKey =~ /pattern/i` */
class RegexExpr implements ContextKeyExpression {
  readonly type = ContextKeyExprType.Regex;
  constructor(readonly key: string, readonly regexp: RegExp | null) { }
  evaluate(context: Context): boolean {
    const value = context.getValue<string>(this.key);
    return this.regexp ? this.regexp.test(value ?? '') : false;
  }
  serialize(): string { return `${this.key} =~ ${this.regexp ? String(this.regexp) : '/invalid/'}`; }
  keys(): string[] { return [this.key]; }
}

class AndExpr implements ContextKeyExpression {
  readonly type = ContextKeyExprType.And;
  constructor(readonly expr: ContextKeyExpression[]) { }
  evaluate(context: Context): boolean { return this.expr.every(e => e.evaluate(context)); }
  serialize(): string { return this.expr.map(e => e.serialize()).join(' && '); }
  keys(): string[] { return this.expr.flatMap(e => e.keys()); }
}

class OrExpr implements ContextKeyExpression {
  readonly type = ContextKeyExprType.Or;
  constructor(readonly expr: ContextKeyExpression[]) { }
  evaluate(context: Context): boolean { return this.expr.some(e => e.evaluate(context)); }
  serialize(): string { return this.expr.map(e => e.serialize()).join(' || '); }
  keys(): string[] { return this.expr.flatMap(e => e.keys()); }
}

/** `when` 절을 코드로 조립할 때 쓰는 팩토리. */
export namespace ContextKeyExpr {
  export function isTrue(): ContextKeyExpression { return TrueExpr.INSTANCE; }
  export function isFalse(): ContextKeyExpression { return FalseExpr.INSTANCE; }
  export function has(key: string): ContextKeyExpression { return new DefinedExpr(key); }
  export function not(key: string): ContextKeyExpression { return new NotExpr(key); }
  export function equals(key: string, value: unknown): ContextKeyExpression { return new EqualsExpr(key, value); }
  export function notEquals(key: string, value: unknown): ContextKeyExpression { return new NotEqualsExpr(key, value); }
  export function regex(key: string, pattern: RegExp | null): ContextKeyExpression { return new RegexExpr(key, pattern); }

  export function and(...expr: Array<ContextKeyExpression | undefined | null>): ContextKeyExpression | undefined {
    const items = expr.filter((e): e is ContextKeyExpression => !!e);
    return items.length === 0 ? undefined : (items.length === 1 ? items[0] : new AndExpr(items));
  }

  export function or(...expr: Array<ContextKeyExpression | undefined | null>): ContextKeyExpression | undefined {
    const items = expr.filter((e): e is ContextKeyExpression => !!e);
    return items.length === 0 ? undefined : (items.length === 1 ? items[0] : new OrExpr(items));
  }

  /**
   * 문자열 `when` 절을 식으로 파싱한다. (예: `paneFocused && !inputFocused`)
   *
   * 주의: 괄호를 지원하지 않는다. `||`로 자른 뒤 `&&`로 자르는 방식이므로
   * 우선순위는 항상 `&&` > `||`로 고정된다. 이걸로 부족해지면 그때
   * VSCode의 scanner.ts 스타일 파서로 교체하면 된다.
   */
  export function deserialize(serialized: string | null | undefined): ContextKeyExpression | undefined {
    if (!serialized) {
      return undefined;
    }
    return or(...serialized.split('||').map(part =>
      and(...part.split('&&').map(term => deserializeOne(term.trim())))
    ));
  }
}

function deserializeOne(serialized: string): ContextKeyExpression | undefined {
  if (serialized.length === 0) {
    return undefined;
  }
  if (serialized === 'true') { return ContextKeyExpr.isTrue(); }
  if (serialized === 'false') { return ContextKeyExpr.isFalse(); }

  let match = /^([^!=~]+)(!=|==|=~)(.*)$/.exec(serialized);
  if (match) {
    const key = match[1].trim();
    const op = match[2];
    const rawValue = match[3].trim();
    if (op === '=~') {
      return ContextKeyExpr.regex(key, parseRegex(rawValue));
    }
    const value = parseValue(rawValue);
    return op === '==' ? ContextKeyExpr.equals(key, value) : ContextKeyExpr.notEquals(key, value);
  }

  match = /^\!\s*([^\s]+)$/.exec(serialized);
  if (match) {
    return ContextKeyExpr.not(match[1].trim());
  }

  return ContextKeyExpr.has(serialized);
}

function parseValue(serialized: string): unknown {
  if (serialized === 'true') { return true; }
  if (serialized === 'false') { return false; }
  const quoted = /^'([^']*)'$/.exec(serialized);
  if (quoted) { return quoted[1]; }
  return serialized;
}

function parseRegex(serialized: string): RegExp | null {
  if (serialized[0] !== '/') { return null; }
  const end = serialized.lastIndexOf('/');
  if (end <= 0) { return null; }
  try {
    return new RegExp(serialized.slice(1, end), serialized.slice(end + 1));
  } catch {
    return null;
  }
}
