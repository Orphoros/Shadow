import { ApplicationCommand, CacheType, CommandInteraction } from 'discord.js';
import { DiscordClient } from './client';

export interface CommandSnippet {
   data: ApplicationCommand;
   execute: (i: CommandInteraction<CacheType>, c: DiscordClient) => Promise<void>;
}
