import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction, MessageActionRow,
  MessageEmbed, MessageSelectMenu,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ISelectableRegionRoleOption, SelectableRegionRoleOption } from '../../../schemas';
import {
  isUserAuthorized, errorLog, EmbedMessageType, sendResponse,
} from '../../../util';

export default {
  data: new SlashCommandBuilder()
    .setName('show-region-panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Prints the region role panel to the current channel')
    .addStringOption((option) => option
      .setName('embed-json')
      .setDescription('Embed to display for the region role panel message. Must be a valid JSON string.')
      .setRequired(false)),
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const roleOptions: ISelectableRegionRoleOption[] = await SelectableRegionRoleOption
        .find({
          guild_id: interaction.guild?.id,
        }).exec();

      if (roleOptions.length === 0) {
        sendResponse(interaction, `There are no region roles added to the role selection menu! 
        Cannot display the menu until there are roles added to the selection.
        First add some region roles to the menu by slash commands!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      } else {
        const options = roleOptions.map((r) => ({
          label: interaction.guild?.roles.cache.get(r.region_role_id)?.name ?? 'Unknown',
          value: r.region_role_id,
          description: r.region_description,
          emoji: r.region_emoji,
        }));

        options.push({
          label: 'None',
          value: '-1',
          description: 'No region to display',
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
            .setTitle('Select your region from the list below!');
        }

        const components = [
          new MessageActionRow().addComponents(new MessageSelectMenu()
            .setCustomId('reaction-region')
            .addOptions(options)
            .setPlaceholder('Select your region')),
        ];
        sendResponse(interaction, 'Region selector menu is displayed successfully!', EmbedMessageType.Success, 'Could not send interaction message to user');
        interaction.channel!.send({
          embeds: [panelMsg],
          components,
        }).catch((e) => {
          errorLog('Could not send interaction message to user\n========================\n%O', e);
        });
      }
    } else {
      sendResponse(interaction, 'You do not have the permission to display the region selector menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
