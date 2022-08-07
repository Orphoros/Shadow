import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction, GuildMember,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { EmbedMessageType, returnEmbed } from '../util/responseGiver';
import { DiscordClient } from '../typings/client';
import { errorLog } from '../util/dbg';
import { isUserAuthorized } from '../util/mongoIO';
// TODO: remove this file before release
export default {
  data: new SlashCommandBuilder()
    .setName('simulate-join')
    .setDescription('Simulate a user joining the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands),
  async execute(interaction: CommandInteraction<CacheType>, client: DiscordClient): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      client.emit('guildMemberAdd', interaction.member as GuildMember);
      interaction.reply({
        embeds: [returnEmbed('Simulated join', EmbedMessageType.Success)],
        ephemeral: true,
      }).catch((e) => {
        errorLog('Could not send interaction message to user: %O', e);
      });
    } else {
      interaction.reply({
        embeds: [returnEmbed('You do not have permission to set the status of the bot.', EmbedMessageType.Error)],
        ephemeral: true,
      }).catch((e) => {
        errorLog('Could not send interaction message to user: %O', e);
      });
    }
  },
};
