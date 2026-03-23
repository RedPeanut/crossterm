console.log('👋 This message is being logged by "renderer", included via webpack');

import '@vscode/codicons/dist/codicon.css';
import './index.css';
import { MainLayout, MainLayoutService } from './layout/MainLayout';
import { domContentLoaded } from './util/dom';

import { ElectronHandler } from '../main/preload';
import { ConfigsInitialValueType } from '../common/configs';
import { ListItemElem } from './component/List';

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

  initial_value: ConfigsInitialValueType;
  list: ListItemElem[];

  constructor() {}

  async open() {
    await Promise.all([domContentLoaded(mainWindow), this.loadInMain()]);
    const mainLayout = new MainLayout(mainWindow.document.body);
    await mainLayout.startup();
  }

  async loadInMain(): Promise<void> {
    this.window.isMaximized = await window.ipc.invoke('window get', 'function', 'isMaximized');
    this.window.isMinimized = await window.ipc.invoke('window get', 'function', 'isMinimized');
    this.process.platform = await window.ipc.invoke('process get', 'property', 'platform');
    this.path.sep = this.process.platform === 'win32' ? '\\' : '/';
    this.package_json = await window.ipc.invoke('get package json');
    this.initial_value = await window.ipc.invoke('config get', 'initial_value');
    this.list = await window.ipc.invoke('config get', 'list');
  }
}

export const renderer = new Renderer();
renderer.open();
