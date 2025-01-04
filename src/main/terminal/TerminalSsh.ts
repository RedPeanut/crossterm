import { Client, ClientChannel } from 'ssh2';
import { EventEmitter } from 'events';
import { TerminalItem } from '../../common/Types';
import DataBatcher from './DataBatcher';
// import { TerminalOptions } from 'main/Types';

export default class TerminalSsh extends EventEmitter {

  options: TerminalItem;
  batcher: DataBatcher | null = null;
  conn?: Client;
  stream?: ClientChannel;

  constructor(options: TerminalItem) {
    super();
    this.options = options;
    // this.start(options);
  }

  start() {
    // console.log('start() is called..');
    // const { uid } = this.options;
    this.batcher = new DataBatcher(this.options.uid);
    this.batcher.on('flush', (data: string) => {
      // console.log('flush event is called...');
      this.emit('data', data);
    });

    const conn = this.conn = new Client();
    let connected = false;
    conn.on('keyboard-interactive',
      (
        name,
        instructions,
        instructionsLang,
        prompts,
        finish
      ) => {

      }
    );
    conn.on('handshake', async handshake => {});
    conn.on('x11', () => {});
    conn.on('ready', () => {
      // console.log('ready event is called..');
      connected = true;
      // open shell channel
      conn.shell({ term: 'xterm-256color' }, {}, (err, stream) => {
        if(err) throw err;
        stream.on('close', () => {
          console.log('Stream :: close');
          conn.end();
        }).on('data', (data: any) => {
          //console.log('OUTPUT: ' + data);
          this.batcher?.write(data);
        });
        this.stream = stream;
      });
    });
    conn.on('error', error => {
      console.log('error =', error);
    });

    // console.log('this.options =', this.options);
    if(this.options.url) {
      conn.connect({
        host: this.options.url.host,
        port: this.options.url.port,
        username: this.options.url.username,
        password: this.options.url.password,
        // privateKey: options.url.password,
        // hostVerifier: (key: any) => { return true; },
        // authHandler: (methodsLeft, partialSuccess, callback) => {}
      });
    };
  }

  async destroy(): Promise<void> {
    this.stream && this.stream.end();
    delete this.stream;
    this.conn && this.conn.end();
  }

  /* on(event: any, cb: any) {
    this.stream?.on(event, cb);
    this.stream?.stderr.on(event, cb);
  }

  write(data: any) {
    try {
      this.stream?.write(data);
      // this.writeLog(data);
    } catch(e) {
      // log.error(e);
    }
  } */
}
