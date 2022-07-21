import { ApplicationCommand, CacheType, CommandInteraction } from 'discord.js';

export interface CommandSnippet {
   data: ApplicationCommand;
   execute: (i: CommandInteraction<CacheType>) => Promise<void>;
}
