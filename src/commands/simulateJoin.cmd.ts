import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction, GuildMember,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { DiscordClient } from '../typings/client';
import {
  isUserAuthorized, errorLog, EmbedMessageType, returnEmbed, sendResponse,
} from '../util';

export default {
  data: new SlashCommandBuilder()
    .setName('simulate-join')
    .setDescription('Simulate a user joining the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands),
  async execute(interaction: CommandInteraction<CacheType>, client: DiscordClient): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      client.emit('guildMemberAdd', interaction.member as GuildMember);
      sendResponse(interaction, 'Simulated a user join with your user!', EmbedMessageType.Success, 'Could not send interaction message to user');
    } else {
      interaction.reply({
        embeds: [returnEmbed('You do not have permission to set the status of the bot.', EmbedMessageType.Error)],
        ephemeral: true,
      }).catch((e) => {
        errorLog('Could not send interaction message to user\n========================\n%O', e);
      });
    }
  },
};
