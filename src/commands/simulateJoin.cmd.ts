import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction, GuildMember,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { DiscordClient } from '../typings/client';
import {
  isUserAuthorized, EmbedMessageType, sendResponse,
} from '../util';

export default {
  data: new SlashCommandBuilder()
    .setName('simulate-join')
    .setDescription('Simulate a user joining the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands),
  async execute(interaction: CommandInteraction<CacheType>, client: DiscordClient): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      client.emit('guildMemberAdd', interaction.member as GuildMember);
      sendResponse(interaction, 'Simulated a user join with your user in the configured welcome channel!', EmbedMessageType.Info, 'Could not send interaction message to user');
    } else {
      sendResponse(interaction, 'You are not authorized to execute debugging and testing commands!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
