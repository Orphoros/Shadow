import { SlashCommandBuilder } from '@discordjs/builders';
import {
  ActionRowBuilder,
  CacheType, ChatInputCommandInteraction, EmbedBuilder, StringSelectMenuBuilder,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ISelectableDutyRoleOption, SelectableDutyRoleOption } from '../../../schemas';
import {
  isUserAuthorized, errorLog, EmbedMessageType, sendResponse,
} from '../../../util';

export default {
  data: new SlashCommandBuilder()
    .setName('show-duty-panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Prints the duty role panel to the current channel')
    .addStringOption((option) => option
      .setName('embed-json')
      .setDescription('Embed to display for the duty role panel message. Must be a valid JSON string.')
      .setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const roleOptions: ISelectableDutyRoleOption[] = await SelectableDutyRoleOption
        .find({
          guild_id: interaction.guild?.id,
        }).exec();

      if (roleOptions.length === 0) {
        sendResponse(interaction, `There are no duty roles added to the role selection menu! 
        Cannot display the menu until there are roles added to the selection.
        First add some duty roles to the menu by slash commands!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      } else {
        const options = roleOptions.map((r) => ({
          label: interaction.guild?.roles.cache.get(r.duty_role_id)?.name ?? 'Unknown',
          value: r.duty_role_id,
          description: r.duty_description,
          emoji: r.duty_emoji,
        }));

        options.push({
          label: 'None',
          value: '-1',
          description: 'No duty to display',
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
          panelMsg = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Select your duty from the list below!');
        }

        const components = [
          new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(new StringSelectMenuBuilder()
              .setCustomId('reaction-duty')
              .addOptions(options)
              .setPlaceholder('Select your duty')),
        ];
        sendResponse(interaction, 'Duty selector menu is displayed successfully!', EmbedMessageType.Success, 'Could not send interaction message to user');
        interaction.channel!.send({
          embeds: [panelMsg],
          components,
        }).catch((e) => {
          errorLog('Could not send interaction message to user\n========================\n%O', e);
        });
      }
    } else {
      sendResponse(interaction, 'You do not have the permission to display the duty selector menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
