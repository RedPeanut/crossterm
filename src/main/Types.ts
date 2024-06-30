export interface TypedEmitter<Events> {
  on<E extends keyof Events>(event: E, listener: (args: Events[E]) => void): this;
  once<E extends keyof Events>(event: E, listener: (args: Events[E]) => void): this;
  // emit<E extends Exclude<keyof Events, FilterNever<Events>>>(event: E): boolean;
  // emit<E extends FilterNever<Events>>(event: E, data: Events[E]): boolean;
  emit<E extends keyof Events>(event: E, data?: Events[E]): boolean;
  removeListener<E extends keyof Events>(event: E, listener: (args: Events[E]) => void): this;
  removeAllListeners<E extends keyof Events>(event?: E): this;
}

export interface TerminalOptions {
  uid: string;
  cwd?: string;
  splitDirection?: 'HORIZONTAL' | 'VERTICAL';
  // activeUid?: string | null;
  // isNewGroup?: boolean;
  rows?: number;
  cols?: number;
  shell?: string;
  shellArgs?: string[];
  // profile?: string;
};
