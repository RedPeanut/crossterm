import { Event } from '../base/event';

/**
 * 설정 변경 이벤트.
 * 어떤 키들이 바뀌었는지와, 특정 섹션이 영향을 받았는지 질의할 수 있는 헬퍼를 제공한다.
 * (VSCode의 IConfigurationChangeEvent를 단순화한 형태)
 */
export interface ConfigurationChangeEvent {
  readonly affectedKeys: string[];
  affectsConfiguration(section: string): boolean;
}

/**
 * 프로세스 간(IPC)으로 전달하는 설정 변경 정보.
 * `ConfigurationChangeEvent`는 함수(`affectsConfiguration`)를 포함해 structured clone이 불가능하므로,
 * 직렬화 가능한 키 목록만 보내고 받는 쪽에서 `createChangeEvent`로 이벤트를 재구성한다.
 */
export interface SerializedConfigurationChange {
  readonly affectedKeys: string[];
}

/** 변경된 점 표기 키 목록으로 설정 변경 이벤트를 만든다. */
export function createChangeEvent(affectedKeys: Iterable<string>): ConfigurationChangeEvent {
  const keys = [...affectedKeys];
  return {
    affectedKeys: keys,
    affectsConfiguration: (section: string) => {
      for (const key of keys) {
        if (key === section || key.startsWith(section + '.') || section.startsWith(key + '.')) {
          return true;
        }
      }
      return false;
    },
  };
}

/** 설정 변경 이벤트를 IPC로 보낼 수 있는 형태로 변환한다. */
export function serializeChangeEvent(change: ConfigurationChangeEvent): SerializedConfigurationChange {
  return { affectedKeys: [...change.affectedKeys] };
}

/**
 * 애플리케이션 설정을 읽고 쓰는 서비스.
 *
 * VSCode의 다층(default/policy/user/workspace/folder) 구조를 단순화하여
 * `default`(코드 기본값) <- `user`(설정 파일) 2개 레이어만 병합한다.
 */
export interface ConfigurationService {
  readonly onDidChangeConfiguration: Event<ConfigurationChangeEvent>;
  init(): Promise<void>;
  getValue<T>(): Promise<T>;
  getValue<T>(section: string): Promise<T>;
  updateValue(key: string, value: unknown): Promise<void>;
  keys(): Promise<string[]>;
  reload(): Promise<void>;
}
