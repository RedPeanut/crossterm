let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isWeb = false;
let _isIOS = false;
let _isMobile = false;
let _userAgent: string | undefined = undefined;

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

interface Navigator {
  userAgent: string;
  maxTouchPoints?: number;
  language: string;
}
declare const navigator: Navigator;

let nodeProcess: NodeProcess | undefined = undefined;
if (typeof process !== 'undefined' && typeof process?.versions?.node === 'string') {
  // Native environment (non-sandboxed)
  nodeProcess = process;
}

// Native environment
if (typeof nodeProcess === 'object') {
  _isWindows = (nodeProcess.platform === 'win32');
  _isMacintosh = (nodeProcess.platform === 'darwin');
  _isLinux = (nodeProcess.platform === 'linux');
}

// Web environment
else if (typeof navigator === 'object') {
  _userAgent = navigator.userAgent;
  _isWindows = _userAgent.indexOf('Windows') >= 0;
  _isMacintosh = _userAgent.indexOf('Macintosh') >= 0;
  _isLinux = _userAgent.indexOf('Linux') >= 0;
  _isIOS = (_userAgent.indexOf('Macintosh') >= 0 || _userAgent.indexOf('iPad') >= 0 || _userAgent.indexOf('iPhone') >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
  _isMobile = _userAgent?.indexOf('Mobi') >= 0;
  _isWeb = true;
}

export const isWindows = _isWindows;
export const isMacintosh = _isMacintosh;
export const isLinux = _isLinux;