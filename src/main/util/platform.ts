let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;

export interface ProcessEnvironment {
  [key: string]: string | undefined;
}

/**
 * see vscode's comment in vs/base/common/platform.ts
 */
export interface NodeProcess {
  platform: string;
  arch: string;
  env: ProcessEnvironment;
  versions?: {
    node?: string;
    electron?: string;
    chrome?: string;
  };
  type?: string;
  cwd: () => string;
}

declare const process: NodeProcess;

let nodeProcess: NodeProcess | undefined = undefined;
if(typeof process !== 'undefined' && typeof process?.versions?.node === 'string') {
  // Native environment (non-sandboxed)
  nodeProcess = process;
}

// Native environment
if(typeof nodeProcess === 'object') {
  _isWindows = (nodeProcess.platform === 'win32');
  _isMacintosh = (nodeProcess.platform === 'darwin');
  _isLinux = (nodeProcess.platform === 'linux');
}

export const isWindows = _isWindows;
export const isMacintosh = _isMacintosh;
export const isLinux = _isLinux;