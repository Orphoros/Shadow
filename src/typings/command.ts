import { ApplicationCommand, CacheType, ChatInputCommandInteraction } from 'discord.js';
import { DiscordClient } from './client';

export interface CommandSnippet {
   data: ApplicationCommand;
   execute: (i: ChatInputCommandInteraction<CacheType>, c: DiscordClient) => Promise<void>;
}
