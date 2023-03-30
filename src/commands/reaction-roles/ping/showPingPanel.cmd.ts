import { SlashCommandBuilder } from '@discordjs/builders';
import {
  ActionRowBuilder,
  CacheType, ChatInputCommandInteraction,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ISelectablePingRoleOption, SelectablePingRoleOption } from '../../../schemas';
import {
  isUserAuthorized, errorLog, EmbedMessageType, sendResponse,
} from '../../../util';

export default {
  data: new SlashCommandBuilder()
    .setName('show-ping-panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Prints the ping panel to the current channel')
    .addStringOption((option) => option
      .setName('embed-json')
      .setDescription('Embed to display for the ping panel message. Must be a valid JSON string.')
      .setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const roleOptions: ISelectablePingRoleOption[] = await SelectablePingRoleOption.find({
        guild_id: interaction.guild?.id,
      }).exec();

      if (roleOptions.length === 0) {
        sendResponse(interaction, `There are no ping roles added to the ping selection menu! 
        Cannot display the menu until there are roles added to the selection.
        First add some ping roles to the menu by slash commands!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      } else {
        const options = roleOptions.map((r) => ({
          label: interaction.guild?.roles.cache.get(r.ping_role_id)?.name ?? 'Unknown',
          value: r.ping_role_id,
          description: r.ping_description,
          emoji: r.ping_emoji,
        }));

        const embed = interaction.options.getString('embed-json');
        let panelMsg;

        if (embed) {
          try {
            panelMsg = JSON.parse(embed);
          } catch (e) {
            sendResponse(interaction, 'The embed JSON string is not valid!', EmbedMessageType.Error, 'Could not send interaction message to user');
            return;
          }
        } else {
          panelMsg = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Select for what you want to get pinged! Deselect all of them to clear your preferences!');
        }

        const components = [
          new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(new StringSelectMenuBuilder()
              .setCustomId('reaction-ping')
              .setMinValues(0)
              .setMaxValues(roleOptions.length)
              .addOptions(options)
              .setPlaceholder('Select your ping preferences')),
        ];
        sendResponse(interaction, 'Ping menu is displayed successfully!', EmbedMessageType.Success, 'Could not send interaction message to user');
        interaction.channel!.send({
          embeds: [panelMsg],
          components,
        }).catch((e) => {
          errorLog('Could not send interaction message to user\n========================\n%O', e);
        });
      }
    } else {
      sendResponse(interaction, 'You do not have the permission to display the ping menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
