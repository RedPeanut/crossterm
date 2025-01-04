import os from 'os';
import { IPty, spawn } from 'node-pty';
// import TerminalBase from './TerminalBase';
// import { TerminalOptions } from 'main/Types';
import { EventEmitter } from 'events';
import DataBatcher from './DataBatcher';
import { TerminalItem } from '../../common/Types';
// import DataBatcher from 'main/terminal/DataBatcher'; // why not

export default class TerminalLocal extends EventEmitter {

  pty: IPty | null = null;
  batcher: DataBatcher | null = null;
  shell: string | undefined;
  initTimestamp: number = new Date().getTime();
  options: TerminalItem;

  constructor(options: TerminalItem) {
    super();
    this.options = options;
  }

  start() {
    const { uid } = this.options;
    // Initialize node-pty with an appropriate shell
    const shell = os.platform() === 'win32' ? 'cmd.exe' : 'bash';
    this.pty = spawn(shell!, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: process.cwd(),
      env: process.env
    });

    this.batcher = new DataBatcher(uid);
    this.pty.onData((chunk) => {
      // console.log('chunk =', chunk);
      this.batcher?.write(chunk);
    });

    this.batcher.on('flush', (data: string) => {
      // console.log('flush event is called...');
      this.emit('data', data);
    });

    this.pty.onExit((e) => {});
    this.shell = shell;
  }

  write(data: string) {
    if(this.pty) {
      this.pty.write(data);
    } else {
      console.warn('Warning: Attempted to write to a session with no pty');
    }
  }

}
