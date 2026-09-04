import { CommandsRegistryImpl } from "./key/Commands";
import { KeybindingsRegistryImpl } from "./key/KeybindingsRegistry";

export const commandsRegistry = new CommandsRegistryImpl();
export const keybindingsRegistry = new KeybindingsRegistryImpl();