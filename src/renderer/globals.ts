// import { CommandsRegistryImpl } from "./key/CommandService";
import { CommandsRegistryImpl } from "./key/CommandsRegistry";
import { KeybindingsRegistryImpl } from "./key/KeybindingsRegistry";

export const commandsRegistry = new CommandsRegistryImpl();
export const keybindingsRegistry = new KeybindingsRegistryImpl();