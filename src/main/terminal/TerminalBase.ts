import EventEmitter from 'events';
import { TerminalOptions } from '../Types';

export default class TerminalBase extends EventEmitter {

  options;

  constructor(options: TerminalOptions) {
    super();
    this.options = options;
  }
}
