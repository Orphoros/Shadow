import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction, MessageActionRow,
  MessageEmbed, MessageSelectMenu,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ISelectableColorRoleOption, SelectableColorRoleOption } from '../../../schemas';
import {
  errorLog, isUserAuthorized, EmbedMessageType, sendResponse,
} from '../../../util';

export default {
  data: new SlashCommandBuilder()
    .setName('show-color-panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Prints the selectable color panel to the current channel')
    .addStringOption((option) => option
      .setName('embed-json')
      .setDescription('Embed to display for the color panel message. Must be a valid JSON string.')
      .setRequired(false)),
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const roleOptions: ISelectableColorRoleOption[] = await SelectableColorRoleOption.find({
        guild_id: interaction.guild?.id,
      }).exec();

      if (roleOptions.length === 0) {
        sendResponse(interaction, `There are no color roles added to the color selection menu! 
        Cannot display the panel until there are roles added to the color selection list.
        First add some roles to the panel by slash commands!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      } else {
        const options = roleOptions.map((r) => ({
          label: interaction.guild?.roles.cache.get(r.color_role_id)?.name ?? 'Unknown',
          value: r.color_role_id,
          description: r.color_description,
          emoji: r.color_emoji,
        }));

        options.push({
          label: 'None',
          value: '-1',
          description: 'No colors from this selection',
          emoji: '❌',
        });

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
          panelMsg = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Select your color from the list below');
        }

        const components = [
          new MessageActionRow().addComponents(new MessageSelectMenu()
            .setCustomId('reaction-colors')
            .addOptions(options)
            .setPlaceholder('Select a color')),
        ];
        sendResponse(interaction, 'Color selector menu is displayed successfully!', EmbedMessageType.Success, 'Could not send interaction message to user');
        interaction.channel!.send({
          embeds: [panelMsg],
          components,
        }).catch((e) => {
          errorLog('Could not send interaction message to user\n========================\n%O', e);
        });
      }
    } else {
      sendResponse(interaction, 'You do not have the permission to display color selector menus!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
