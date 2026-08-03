import { Disposable } from '../../common/base/lifecycle';
import { Emitter, Event } from '../../common/base/event';
import { FileService } from '../../common/service/FileService';
import { ConfigurationService, ConfigurationChangeEvent } from '../../common/service/ConfigurationService';
import { fileServiceId, getService } from '../Service';
import { app } from 'electron';
import path from 'path';
import { EnvironmentService } from './EnvironmentService';

/**
 * 앞선 작업이 끝나야 다음 작업이 시작되도록 Promise를 직렬화하는 최소 큐.
 * (VSCode base/common/async 의 Queue 단순화 버전 — 쓰기 레이스 방지용)
 */
class Queue {
  private last: Promise<unknown> = Promise.resolve();

  queue<T>(task: () => Promise<T>): Promise<T> {
    const run = this.last.then(task, task);
    // 이전 작업의 실패가 다음 작업까지 막지 않도록 에러는 흡수한 체인을 별도 유지
    this.last = run.then(() => undefined, () => undefined);
    return run;
  }
}

export class MainConfigurationService extends Disposable implements ConfigurationService {

  private readonly _onDidChangeConfiguration = this._register(new Emitter<ConfigurationChangeEvent>());
  readonly onDidChangeConfiguration: Event<ConfigurationChangeEvent> = this._onDidChangeConfiguration.event;

  /** 쓰기 직렬화 큐 */
  private readonly writeQueue = new Queue();

  /** 설정 파일(user)에서 읽어들인 값 */
  private userConfiguration: Record<string, unknown> = {};

  /** default <- user 병합 결과 (조회 대상) */
  private configuration: Record<string, unknown> = {};

  private settingsPath: string;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly fileService: FileService,
    /** 코드에 정의된 기본값 (VSCode의 DefaultConfiguration 역할) */
    private readonly defaults: Record<string, unknown> = {},
  ) {
    super();
    this.settingsPath = path.join(this.environmentService.userDataPath, 'settings.json');
    this.configuration = deepMerge(this.defaults, this.userConfiguration);
  }

  async init(): Promise<void> {
    this.userConfiguration = await this.loadUserConfiguration();
    this.configuration = deepMerge(this.defaults, this.userConfiguration);
  }

  getValue<T>(section?: string): T {
    if (!section) {
      return this.configuration as unknown as T;
    }
    return getPath(this.configuration, section) as T;
  }

  async updateValue(key: string, value: unknown): Promise<void> {
    // 기본값과 같으면 사용자 설정에서 제거한다. (VSCode와 동일한 동작)
    if (deepEquals(value, getPath(this.defaults, key))) {
      value = undefined;
    }

    // 쓰기는 큐로 직렬화하여 동시 호출 시 파일이 깨지는 것을 막는다.
    await this.writeQueue.queue(() => this.doWrite(key, value));
    await this.reload();
  }

  keys(): string[] {
    return Object.keys(this.configuration);
  }

  // --- 내부 구현 -------------------------------------------------------------

  private async doWrite(key: string, value: unknown): Promise<void> {
    const raw = await this.loadUserConfiguration();

    if (value === undefined) {
      deletePath(raw, key);
    } else {
      setPath(raw, key, value);
    }

    await this.fileService.writeFileAtomic(
      this.settingsPath,
      JSON.stringify(raw, null, 2),
      { encoding: 'utf8' },
    );
  }

  private async reload(): Promise<void> {
    const previous = this.configuration;
    this.userConfiguration = await this.loadUserConfiguration();
    this.configuration = deepMerge(this.defaults, this.userConfiguration);

    const affectedKeys = diffKeys(previous, this.configuration);
    if (affectedKeys.size > 0) {
      this._onDidChangeConfiguration.fire(createChangeEvent(affectedKeys));
    }
  }

  private async loadUserConfiguration(): Promise<Record<string, unknown>> {
    try {
      const buffer = await this.fileService.readFile(this.settingsPath, {});
      const content = buffer.toString().trim();
      return content ? JSON.parse(content) : {};
    } catch {
      // 파일이 없거나 파싱 실패 시 빈 설정으로 취급
      return {};
    }
  }
}

// --- 순수 헬퍼 함수 ----------------------------------------------------------

function createChangeEvent(affectedKeys: Set<string>): ConfigurationChangeEvent {
  return {
    affectedKeys,
    affectsConfiguration: (section: string) => {
      for (const key of affectedKeys) {
        if (key === section || key.startsWith(section + '.') || section.startsWith(key + '.')) {
          return true;
        }
      }
      return false;
    },
  };
}

/** `a.b.c` 경로로 중첩된 값을 읽는다. */
function getPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, obj);
}

/** `a.b.c` 경로에 값을 쓴다. 중간 객체는 없으면 생성한다. */
function setPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const segments = path.split('.');
  const last = segments.pop()!;
  let cursor = obj;
  for (const segment of segments) {
    if (!cursor[segment] || typeof cursor[segment] !== 'object') {
      cursor[segment] = {};
    }
    cursor = cursor[segment] as Record<string, unknown>;
  }
  cursor[last] = value;
}

/** `a.b.c` 경로의 값을 삭제한다. */
function deletePath(obj: Record<string, unknown>, path: string): void {
  const segments = path.split('.');
  const last = segments.pop()!;
  let cursor = obj;
  for (const segment of segments) {
    if (!cursor[segment] || typeof cursor[segment] !== 'object') {
      return;
    }
    cursor = cursor[segment] as Record<string, unknown>;
  }
  delete cursor[last];
}

/** base 위에 override 를 덮어쓴 새 객체를 만든다. (재귀 병합) */
function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    const overrideValue = override[key];
    const baseValue = result[key];
    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key] = deepMerge(baseValue, overrideValue);
    } else {
      result[key] = overrideValue;
    }
  }
  return result;
}

/** 두 설정 트리를 평탄화 후 비교하여 값이 달라진 점 표기 키들을 반환한다. */
function diffKeys(a: Record<string, unknown>, b: Record<string, unknown>): Set<string> {
  const flatA = flatten(a);
  const flatB = flatten(b);
  const changed = new Set<string>();
  for (const key of new Set([...Object.keys(flatA), ...Object.keys(flatB)])) {
    if (!deepEquals(flatA[key], flatB[key])) {
      changed.add(key);
    }
  }
  return changed;
}

/** 중첩 객체를 `a.b.c` -> value 형태로 평탄화한다. */
function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (isPlainObject(value)) {
      Object.assign(result, flatten(value, path));
    } else {
      result[path] = value;
    }
  }
  return result;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepEquals(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
