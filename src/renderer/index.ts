console.log('👋 This message is being logged by "renderer", included via webpack');

// 반드시 가장 먼저 import 한다. (nls.init.ts 참고)
import './nls.init';
import '@vscode/codicons/dist/codicon.css';
import './theme.css';
import './index.css';
import './popup.css';
import './dialog.css';
import { MainLayout, MainLayoutService } from './layout/MainLayout';
import { domContentLoaded } from './util/dom';

import { ElectronHandler } from '../main/preload';
import { ConfigsInitialValueType } from '../common/configs';
// import { ListItemElem } from './component/List';
import { RenderStorageService } from './service/RenderStorageService';
import { configurationServiceId, setService, storageServiceId } from './Service';
import { ListItemElem } from '../common/Types';
import { LayoutStateType, StorageService, TreeViewStateType } from '../common/service/StorageService';

import './globals';
import './key/keybindings';
import './menu/menus';
import { ConfigurationService } from '../common/service/ConfigurationService';
import { RenderConfigurationService } from './service/RenderConfigurationService';
import { IDisposable } from '../common/base/lifecycle';

declare global {
  interface Window {
    ipc: ElectronHandler;
  }
}

export type CodeWindow = Window & typeof globalThis;
export const mainWindow = window as CodeWindow;

export class Renderer {

  window: {
    isMaximized?: boolean;
    isMinimized?: boolean;
  } = {};

  process: {
    platform?: string // 'darwin', 'window', 'linux'
  } = {}

  path: {
    sep?: string;
  } = {};

  package_json: {
    name: string,
    version: string,
    author: { name: string, email: string },
    license: string
  };

  // initial_value: ConfigsInitialValueType;
  // list: ListItemElem[];
  sessions: ListItemElem[];
  sessionsDir: string;
  layoutState: LayoutStateType;
  treeViewState: TreeViewStateType;
  themeChangeListener: IDisposable;

  constructor() {}

  async open() {
    await Promise.all([domContentLoaded(mainWindow), this.loadInMain()]);
    const mainLayout = new MainLayout(mainWindow.document.body);
    await mainLayout.startup();
  }

  async loadInMain(): Promise<void> {
    // init main services in here
    const storageService = setService(storageServiceId, new RenderStorageService()) as StorageService;
    const configurationService = setService(configurationServiceId, new RenderConfigurationService()) as ConfigurationService;
    // 레이아웃을 그리기 전에 테마를 적용해 다른 테마가 잠깐 보이는 것을 줄인다. (앱이 끝날 때까지 구독 유지)
    this.themeChangeListener = await this.initTheme(configurationService);
    // console.log(await storageService.get<string>('layoutState'));

    this.window.isMaximized = await window.ipc.invoke('window get', 'function', 'isMaximized');
    this.window.isMinimized = await window.ipc.invoke('window get', 'function', 'isMinimized');
    this.process.platform = await window.ipc.invoke('process get', 'property', 'platform');
    this.path.sep = this.process.platform === 'win32' ? '\\' : '/';
    this.package_json = await window.ipc.invoke('get package json');
    // this.initial_value = await window.ipc.invoke('config get', 'initial_value');
    // this.list = await window.ipc.invoke('config get', 'list');
    this.sessions = await window.ipc.invoke('read sessions dir');
    this.sessionsDir = await window.ipc.invoke('get sessions dir');
    this.layoutState = JSON.parse(await storageService.get<string>('layoutState'));
    this.treeViewState = JSON.parse(await storageService.get<string>('treeViewState'));
  }

  static THEME_KEY = 'workbench.colorTheme';

  /** 알 수 없는 값(예: 예전 버전에서 저장한 값)은 기본 테마(dark)로 취급한다. */
  applyTheme(theme: string | undefined): void {
    document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
  }

  /** 현재 설정값을 적용(`<html data-theme>` 에 반영)하고, 이후 설정이 바뀌면 다시 적용한다. 반환값을 dispose 하면 구독을 끊는다. */
  async initTheme(configurationService: ConfigurationService): Promise<IDisposable> {
    const apply = async () => this.applyTheme(await configurationService.getValue<string>(Renderer.THEME_KEY));
    await apply();
    return configurationService.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration(Renderer.THEME_KEY)) {
        void apply();
      }
    });
  }
}

export const renderer = new Renderer();
renderer.open();
