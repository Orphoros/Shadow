import { Client, Collection } from 'discord.js';
import { AutoVCManager } from '../handlers/autoVCHandler';
import { CommandSnippet } from './command';

export interface DiscordClient extends Client {
   commands: Collection<string, CommandSnippet>;
   vcManager: AutoVCManager;
}
