console.log('👋 This message is being logged by "renderer", included via webpack');

// 반드시 가장 먼저 import 한다. (nls.init.ts 참고)
import './nls.init';
import '@vscode/codicons/dist/codicon.css';
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
}

export const renderer = new Renderer();
renderer.open();
