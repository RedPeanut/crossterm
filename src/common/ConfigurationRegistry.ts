import { setPath } from './base/objects';
import { localize, supportedLocales } from './nls';

/**
 * VSCode의 `vs/platform/configuration/common/configurationRegistry.ts`를 최소 형태로 옮긴 것.
 * 설정 항목(키, 타입, 기본값, 표시 문구)을 전역 레지스트리에 모아두고,
 * main은 기본값(`getDefaultConfiguration`)을, 설정창은 항목 정의를 가져다 쓴다.
 *
 * Note. 표시 문구(title, description, enumDescriptions)는 함수로 두어 꺼낼 때 번역한다.
 *       이 모듈은 setLocale 전에 로드될 수 있으므로 등록 시점에 localize 를 부르면 번역이 안 된다.
 */

/** 설정 항목 하나의 정의. (VSCode의 IConfigurationPropertySchema) */
export interface ConfigurationPropertySchema {
  readonly type: 'boolean' | 'number' | 'string';
  readonly default: boolean | number | string;
  /** 고를 수 있는 값 목록. 있으면 설정창에서 select로 보인다. */
  readonly enum?: readonly string[];
  /** enum 각 값의 표시 문구. enum과 순서가 같다. */
  readonly enumDescriptions?: () => string[];
  /** number 타입의 최솟값/최댓값 */
  readonly minimum?: number;
  readonly maximum?: number;
  readonly title: () => string;
  readonly description: () => string;
}

/** 설정창의 카테고리 하나에 해당하는 항목 묶음. (VSCode의 IConfigurationNode) */
export interface ConfigurationNode {
  readonly id: string;
  readonly title: () => string;
  /** 카테고리 표시 순서. 작을수록 앞. */
  readonly order?: number;
  /** 점 표기 키(`terminal.fontSize`) -> 항목 정의 */
  readonly properties: Readonly<Record<string, ConfigurationPropertySchema>>;
}

export class ConfigurationRegistryImpl {
  private readonly nodes: ConfigurationNode[] = [];
  private readonly properties = new Map<string, ConfigurationPropertySchema>();

  registerConfiguration(node: ConfigurationNode): void {
    for (const key of Object.keys(node.properties)) {
      if (this.properties.has(key)) {
        throw new Error(`Configuration '${key}' is already registered.`);
      }
    }
    for (const [key, schema] of Object.entries(node.properties)) {
      this.properties.set(key, schema);
    }
    this.nodes.push(node);
  }

  /** 카테고리(order -> 등록 순서) 순으로 반환한다. 설정창 좌측 목록용. */
  getConfigurationNodes(): ConfigurationNode[] {
    return this.nodes
      .map((node, index) => ({ node, index }))
      .sort((a, b) => (a.node.order ?? Number.MAX_SAFE_INTEGER) - (b.node.order ?? Number.MAX_SAFE_INTEGER) || a.index - b.index)
      .map(({ node }) => node);
  }

  /** 점 표기 키 -> 항목 정의 */
  getConfigurationProperties(): Record<string, ConfigurationPropertySchema> {
    return Object.fromEntries(this.properties);
  }

  /** 기본값을 settings.json과 같은 중첩 객체로 만든다. (`terminal.fontSize` -> `{ terminal: { fontSize } }`) */
  getDefaultConfiguration(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, schema] of this.properties) {
      setPath(result, key, schema.default);
    }
    return result;
  }
}

export const configurationRegistry = new ConfigurationRegistryImpl();

// --- 기본 설정 항목 ----------------------------------------------------------

configurationRegistry.registerConfiguration({
  id: 'general',
  title: () => localize('settings.category.general', 'General'),
  order: 1,
  properties: {
    'locale': {
      type: 'string',
      // "auto"는 OS 언어를 따른다. (main/locale.ts readUserLocale)
      default: 'auto',
      enum: ['auto', ...supportedLocales],
      enumDescriptions: () => [
        localize('settings.locale.auto', 'Use the operating system language'),
        // 언어 이름은 그 언어로 보여준다. (English, 한국어)
        ...supportedLocales.map(locale => new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale),
      ],
      title: () => localize('settings.locale.title', 'Display Language'),
      description: () => localize('settings.locale.description', 'The display language of the app. Requires a restart to take effect.'),
    },
  },
});

configurationRegistry.registerConfiguration({
  id: 'appearance',
  title: () => localize('settings.category.appearance', 'Appearance'),
  order: 2,
  properties: {
    'workbench.colorTheme': {
      type: 'string',
      default: 'dark',
      enum: ['dark', 'light'],
      enumDescriptions: () => [
        localize('settings.colorTheme.dark', 'Dark'),
        localize('settings.colorTheme.light', 'Light'),
      ],
      title: () => localize('settings.colorTheme.title', 'Color Theme'),
      description: () => localize('settings.colorTheme.description', 'The color theme of the app and terminals.'),
    },
  },
});

configurationRegistry.registerConfiguration({
  id: 'terminal',
  title: () => localize('settings.category.terminal', 'Terminal'),
  order: 3,
  properties: {
    'terminal.fontFamily': {
      type: 'string',
      // 빈 문자열이면 xterm 기본 글꼴을 쓴다.
      default: '',
      title: () => localize('settings.terminal.fontFamily.title', 'Font Family'),
      description: () => localize('settings.terminal.fontFamily.description', 'The font family of the terminal, in CSS font-family format. Leave empty to use the default.'),
    },
    'terminal.fontSize': {
      type: 'number',
      default: 13,
      minimum: 6,
      maximum: 40,
      title: () => localize('settings.terminal.fontSize.title', 'Font Size'),
      description: () => localize('settings.terminal.fontSize.description', 'The font size of the terminal, in pixels.'),
    },
  },
});
