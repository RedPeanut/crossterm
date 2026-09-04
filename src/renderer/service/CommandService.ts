import { commandsRegistry } from '../globals';

export class CommandService {
  async executeCommand<T = unknown>(id: string, ...args: unknown[]): Promise<T | undefined> {
    const command = commandsRegistry.getCommand(id);
    if (!command) {
      throw new Error(`command '${id}' not found`);
    }
    return await command.handler(...args) as T;
  }
}
