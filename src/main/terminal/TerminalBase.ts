import EventEmitter from 'events';
import { TerminalOptions } from '../Types';

export default abstract class TerminalBase extends EventEmitter {

  options;

  constructor(options: TerminalOptions) {
    super();
    this.options = options;
  }

  abstract destroy(): Promise<void>;
  abstract write(data: string);
  abstract resize(cols: number, rows: number): void;
}
