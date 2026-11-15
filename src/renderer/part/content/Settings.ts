import { $, append, _addEventListener } from "../../util/dom";
import { TabContent } from "./Types";
import { Disposable } from '../../../common/base/lifecycle';
import { getPath } from '../../../common/base/objects';
import { localize } from '../../../common/nls';
import { configurationRegistry, ConfigurationNode, ConfigurationPropertySchema } from '../../../common/ConfigurationRegistry';
import { ConfigurationService } from '../../../common/service/ConfigurationService';
import { configurationServiceId, getService } from '../../Service';
import { SettingsItem } from '../../Types';

type SettingValue = boolean | number | string;

/** 설정 항목 한 줄 */
interface SettingRow {
  readonly key: string;
  readonly schema: ConfigurationPropertySchema;
  readonly element: HTMLElement;
  /** 검색 대상 문자열 (소문자) */
  readonly searchText: string;
  /** 컨트롤에 값을 반영한다. */
  setValue(value: SettingValue): void;
}

/** 카테고리 하나 (좌측 목록 항목 + 우측 섹션) */
interface SettingGroup {
  readonly node: ConfigurationNode;
  readonly tocItem: HTMLElement;
  readonly section: HTMLElement;
  readonly rows: SettingRow[];
}

/**
 * 설정 탭.
 * 상단 검색창 / 좌측 카테고리 목록 / 우측 항목 목록으로 구성하며, 값을 바꾸면 즉시 settings.json 에 저장한다.
 * 항목 정의는 `configurationRegistry` 에서 가져온다.
 */
export class Settings extends Disposable implements TabContent {

  parent: HTMLElement;
  element: HTMLElement;
  item: SettingsItem;

  private readonly configurationService: ConfigurationService = getService(configurationServiceId);
  private readonly groups: SettingGroup[] = [];
  private emptyMessage: HTMLElement;

  constructor(parent: HTMLElement, item: SettingsItem) {
    super();
    this.parent = parent;
    this.item = item;
  }

  create(): HTMLElement {
    const el = this.element = $('.settings');
    if (this.item.selected) el.classList.add('selected');
    if (this.item.active) el.classList.add('active');

    const header = append(el, $('.header'));
    const search = append(header, $<HTMLInputElement>('input.search'));
    search.type = 'search';
    search.placeholder = localize('settings.search.placeholder', 'Search settings');
    this._register(_addEventListener(search, 'input', () => this.filter(search.value)));

    const body = append(el, $('.body'));
    const toc = append(body, $('.toc'));
    const list = append(body, $('.list'));

    for (const node of configurationRegistry.getConfigurationNodes()) {
      this.groups.push(this.renderGroup(node, toc, list));
    }
    this.emptyMessage = append(list, $('.empty'));
    this.emptyMessage.textContent = localize('settings.search.noResults', 'No settings found');
    this.emptyMessage.style.display = 'none';
    this.selectGroup(this.groups[0]);

    void this.loadValues();
    // 다른 곳(가져오기, 파일 직접 수정 등)에서 바뀐 값도 반영한다.
    this._register(this.configurationService.onDidChangeConfiguration(e => {
      if (this.groups.some(group => group.rows.some(row => e.affectsConfiguration(row.key)))) {
        void this.loadValues();
      }
    }));

    return el;
  }

  fit(): void {}

  private renderGroup(node: ConfigurationNode, toc: HTMLElement, list: HTMLElement): SettingGroup {
    const tocItem = append(toc, $('.toc-item'));
    tocItem.textContent = node.title();

    const section = append(list, $('section.group'));
    append(section, $('h2.group-title')).textContent = node.title();

    const rows = Object.entries(node.properties).map(([key, schema]) => this.renderRow(section, key, schema));
    const group: SettingGroup = { node, tocItem, section, rows };

    this._register(_addEventListener(tocItem, 'click', () => {
      this.selectGroup(group);
      section.scrollIntoView({ block: 'start' });
    }));
    return group;
  }

  private renderRow(container: HTMLElement, key: string, schema: ConfigurationPropertySchema): SettingRow {
    const element = append(container, $('.row'));

    const titleBar = append(element, $('.row-title'));
    append(titleBar, $('span')).textContent = schema.title();
    const reset = append(titleBar, $<HTMLButtonElement>('button.row-reset.codicon.codicon-discard'));
    reset.title = localize('settings.resetToDefault', 'Reset to Default');
    this._register(_addEventListener(reset, 'click', () => this.update(key, schema.default)));

    append(element, $('.row-description')).textContent = schema.description();

    const setValue = this.renderControl(element, key, schema);
    const searchText = [key, schema.title(), schema.description(), ...(schema.enumDescriptions?.() ?? [])].join('\n').toLowerCase();

    return {
      key, schema, element, searchText,
      setValue: value => {
        setValue(value);
        element.classList.toggle('modified', value !== schema.default);
      },
    };
  }

  /** 타입에 맞는 입력 컨트롤을 만들고, 값을 컨트롤에 반영하는 함수를 돌려준다. */
  private renderControl(container: HTMLElement, key: string, schema: ConfigurationPropertySchema): (value: SettingValue) => void {
    if (schema.enum) {
      const select = append(container, $<HTMLSelectElement>('select.control'));
      const descriptions = schema.enumDescriptions?.() ?? [];
      schema.enum.forEach((value, i) => {
        const option = append(select, $<HTMLOptionElement>('option'));
        option.value = value;
        option.textContent = descriptions[i] ?? value;
      });
      this._register(_addEventListener(select, 'change', () => this.update(key, select.value)));
      return value => select.value = String(value);
    }

    if (schema.type === 'boolean') {
      const checkbox = append(container, $<HTMLInputElement>('input.control'));
      checkbox.type = 'checkbox';
      this._register(_addEventListener(checkbox, 'change', () => this.update(key, checkbox.checked)));
      return value => checkbox.checked = value === true;
    }

    const input = append(container, $<HTMLInputElement>('input.control'));
    if (schema.type === 'number') {
      input.type = 'number';
      if (schema.minimum !== undefined) input.min = String(schema.minimum);
      if (schema.maximum !== undefined) input.max = String(schema.maximum);
    } else {
      input.type = 'text';
      input.spellcheck = false;
    }
    // change 는 Enter 또는 포커스를 잃을 때 발생한다. (입력 중에는 저장하지 않는다)
    this._register(_addEventListener(input, 'change', () => {
      if (schema.type !== 'number') {
        this.update(key, input.value);
        return;
      }
      const value = input.valueAsNumber;
      const valid = Number.isFinite(value)
        && (schema.minimum === undefined || value >= schema.minimum)
        && (schema.maximum === undefined || value <= schema.maximum);
      input.classList.toggle('invalid', !valid);
      if (valid) {
        this.update(key, value);
      }
    }));
    return value => {
      input.value = String(value);
      input.classList.remove('invalid');
    };
  }

  private async update(key: string, value: SettingValue): Promise<void> {
    await this.configurationService.updateValue(key, value);
    // 값이 그대로면(예: 이미 기본값인데 초기화) 변경 이벤트가 오지 않으므로 직접 다시 읽는다.
    await this.loadValues();
  }

  private async loadValues(): Promise<void> {
    const configuration = await this.configurationService.getValue<Record<string, unknown>>();
    for (const group of this.groups) {
      for (const row of group.rows) {
        const value = getPath(configuration, row.key);
        row.setValue(value === undefined ? row.schema.default : value as SettingValue);
      }
    }
  }

  private selectGroup(group: SettingGroup | undefined): void {
    for (const g of this.groups) {
      g.tocItem.classList.toggle('selected', g === group);
    }
  }

  private filter(query: string): void {
    const text = query.trim().toLowerCase();
    let visibleCount = 0;
    for (const group of this.groups) {
      let groupVisible = false;
      for (const row of group.rows) {
        const visible = row.searchText.includes(text);
        row.element.style.display = visible ? '' : 'none';
        groupVisible ||= visible;
        visibleCount += visible ? 1 : 0;
      }
      group.section.style.display = groupVisible ? '' : 'none';
      group.tocItem.style.display = groupVisible ? '' : 'none';
    }
    this.emptyMessage.style.display = visibleCount === 0 ? '' : 'none';
  }
}
