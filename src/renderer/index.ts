console.log('👋 This message is being logged by "renderer", included via webpack');

import '@vscode/codicons/dist/codicon.css';
import './index.css';
import { MainLayout, MainLayoutService } from './layout/MainLayout';
import { domContentLoaded } from './util/dom';

import { ElectronHandler } from '../main/preload';

declare global {
  interface Window {
    ipc: ElectronHandler;
  }
}

export type CodeWindow = Window & typeof globalThis;
export const mainWindow = window as CodeWindow;

export class Renderer {
  constructor() {}

  async open() {
    await Promise.all([domContentLoaded(mainWindow)]);
    const mainLayout = new MainLayout(mainWindow.document.body);
    mainLayout.startup();
  }
}

const renderer = new Renderer();
renderer.open();
