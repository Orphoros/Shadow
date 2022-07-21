import { Client, Collection } from 'discord.js';
import { CommandSnippet } from './command';

export interface DiscordClient extends Client {
   commands: Collection<string, CommandSnippet>;
}
