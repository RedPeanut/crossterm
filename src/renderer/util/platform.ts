let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;

export interface IProcessEnvironment {
  [key: string]: string | undefined;
}

export interface INodeProcess {
  platform: string;
  arch: string;
  env: IProcessEnvironment;
  versions?: {
    node?: string;
    electron?: string;
    chrome?: string;
  };
  type?: string;
  cwd: () => string;
}

declare const process: INodeProcess;
const $globalThis: any = globalThis;
let nodeProcess: INodeProcess | undefined = undefined;
if (typeof process !== 'undefined' && typeof process?.versions?.node === 'string') {
  // Native environment (non-sandboxed)
  nodeProcess = process;
}

interface INavigator {
  userAgent: string;
  maxTouchPoints?: number;
  language: string;
}
declare const navigator: INavigator;

// Native environment
if (typeof nodeProcess === 'object') {
  _isWindows = (nodeProcess.platform === 'win32');
  _isMacintosh = (nodeProcess.platform === 'darwin');
  _isLinux = (nodeProcess.platform === 'linux');
}

export const enum Platform {
  Web,
  Mac,
  Linux,
  Windows
}
export type PlatformName = 'Web' | 'Windows' | 'Mac' | 'Linux';

let _platform: Platform = Platform.Web;
if (_isMacintosh) {
  _platform = Platform.Mac;
} else if (_isWindows) {
  _platform = Platform.Windows;
} else if (_isLinux) {
  _platform = Platform.Linux;
}

export const isWindows = _isWindows;
export const isMacintosh = _isMacintosh;
export const isLinux = _isLinux;