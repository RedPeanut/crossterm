import EventEmitter from 'events';
// import { TerminalOptions } from '../Types';
import { CommonTerminalItem } from '../../common/Types';

export type TerminalBaseOptions = CommonTerminalItem;

export abstract class TerminalBase extends EventEmitter {

  options: TerminalBaseOptions;

  constructor(options: TerminalBaseOptions) {
    super();
    this.options = options;
  }

  abstract start(): void;
  abstract destroy(): Promise<void>;
  abstract write(data: string);
  abstract resize(cols: number, rows: number): void;
}
