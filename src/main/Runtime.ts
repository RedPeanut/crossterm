import { app } from 'electron';
import path from 'path';
import os from 'os';
// const { NODE_ENV } = process.env;

class Runtime {
  public static appPath = app.getPath('appData');
  public static homePath = app.getPath('home');
  public static sshKeysPath = path.resolve(this.homePath, '.ssh');

  public static platform = os.platform();
  public static arch = os.arch();
  public static isWin = this.platform === 'win32';
  public static isMac = this.platform === 'darwin';
  public static isLinux = this.platform === 'linux';
  public static isArm = this.arch.includes('arm');

  public static defaultUserName = 'default_user'; // ??

  // develop, product
  public static isDev = process.env.NODE_ENV === 'development';
  public static isProd = !this.isDev;
  public static minWindowWidth = 590;
  public static minWindowHeight = 400;
  public static defaultLang = 'en_us';
  public static tempDir = os.tmpdir();
  public static homeDir = os.homedir();
  public static packInfo = require(this.isDev ? '../../package.json' : '../package.json')
}

export default Runtime;
