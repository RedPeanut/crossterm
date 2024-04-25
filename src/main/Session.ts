import {EventEmitter} from 'events';
import {StringDecoder} from 'string_decoder';
import {IPty, IWindowsPtyForkOptions, spawn} from 'node-pty';
import {SessionOptions} from './Types';
// Max duration to batch session data before sending it to the renderer process.
const BATCH_DURATION_MS = 16;

// Max size of a session data batch. Note that this value can be exceeded by ~4k
// (chunk sizes seem to be 4k at the most)
const BATCH_MAX_SIZE = 200 * 1024;

// Data coming from the pty is sent to the renderer process for further
// vt parsing and rendering. This class batches data to minimize the number of
// IPC calls. It also reduces GC pressure and CPU cost: each chunk is prefixed
// with the window ID which is then stripped on the renderer process and this
// overhead is reduced with batching.
class DataBatcher extends EventEmitter {
  uid: string;
  decoder: StringDecoder;
  data!: string;
  timeout!: NodeJS.Timeout | null;
  constructor(uid: string) {
    super();
    this.uid = uid;
    this.decoder = new StringDecoder('utf8');

    this.reset();
  }

  reset() {
    this.data = this.uid;
    this.timeout = null;
  }

  write(chunk: Buffer | string) {
    if(this.data.length + chunk.length >= BATCH_MAX_SIZE) {
      // We've reached the max batch size. Flush it and start another one
      if(this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      this.flush();
    }

    this.data += typeof chunk === 'string' ? chunk : this.decoder.write(chunk);

    if(!this.timeout) {
      this.timeout = setTimeout(() => this.flush(), BATCH_DURATION_MS);
    }
  }

  flush() {
    // Reset before emitting to allow for potential reentrancy
    const data = this.data;
    this.reset();
    this.emit('flush', data);
  }
}

export default class Session extends EventEmitter {

  pty: IPty | null;
  batcher: DataBatcher | null;
  shell: string | null;
  ended: boolean;
  initTimestamp: number;
  profile!: string;

  constructor(options: SessionOptions) {
    super();
    this.pty = null;
    this.batcher = null;
    this.shell = null;
    this.ended = false;
    this.initTimestamp = new Date().getTime();
    this.init(options);
  }

  init({uid, rows, cols, cwd, shell = '', shellArgs = [], profile}: SessionOptions) {

    const options: IWindowsPtyForkOptions = {
      cols,
      rows,
      cwd,
      // env: getDecoratedEnv(baseEnv)
    };

    this.pty = spawn(shell, shellArgs, options);

    this.batcher = new DataBatcher(uid);
    this.pty.onData((chunk) => {
      if(this.ended)
        return;
      this.batcher?.write(chunk);
    });

    this.batcher.on('flush', (data: string) => {
      this.emit('data', data);
    });

    this.pty.onExit((e) => {
      if(!this.ended) {
      }
      this.shell = shell;
    });
  }

  exit() {
    this.destroy();
  }

  write(data: string) {
    if(this.pty) {
      this.pty.write(data);
    } else {
      console.warn('Warning: Attempted to write to a session with no pty');
    }
  }

  resize({cols, rows}: {cols: number; rows: number}) {
    if(this.pty) {
      try {
        this.pty.resize(cols, rows);
      } catch(_err) {
        const err = _err as {stack: any};
        console.error(err.stack);
      }
    } else {
      console.warn('Warning: Attempted to resize a session with no pty');
    }
  }

  destroy() {
    if(this.pty) {
      try {
        this.pty.kill();
      } catch(_err) {
        const err = _err as {stack: any};
        console.error('exit error', err.stack);
      }
    } else {
      console.warn('Warning: Attempted to destroy a session with no pty');
    }
    this.emit('exit');
    this.ended = true;
  }

}
