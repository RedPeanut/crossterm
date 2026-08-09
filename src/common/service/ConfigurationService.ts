import { Event } from '../base/event';

/**
 * 설정 변경 이벤트.
 * 어떤 키들이 바뀌었는지와, 특정 섹션이 영향을 받았는지 질의할 수 있는 헬퍼를 제공한다.
 * (VSCode의 IConfigurationChangeEvent를 단순화한 형태)
 */
export interface ConfigurationChangeEvent {
  readonly affectedKeys: ReadonlySet<string>;
  affectsConfiguration(section: string): boolean;
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
}
