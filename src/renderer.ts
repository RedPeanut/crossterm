/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import '@vscode/codicons/dist/codicon.css';
import './index.css';
import { WorkbenchLayout, WorkbenchLayoutService } from './renderer/layout/WorkbenchLayout';
import { domContentLoaded } from './renderer/util/dom';

console.log('👋 This message is being logged by "renderer.js", included via webpack');

import { ElectronHandler } from './preload';

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
    const workbenchLayout = new WorkbenchLayout(mainWindow.document.body);
    workbenchLayout.startup();
  }
}

const renderer = new Renderer();
renderer.open();
