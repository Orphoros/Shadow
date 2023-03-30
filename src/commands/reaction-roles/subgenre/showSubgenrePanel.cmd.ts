import { SlashCommandBuilder } from '@discordjs/builders';
import {
  ActionRowBuilder,
  CacheType, ChatInputCommandInteraction,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ISelectableSubgenreRoleOption, SelectableSubgenreRoleOption } from '../../../schemas';
import {
  isUserAuthorized, errorLog, EmbedMessageType, sendResponse,
} from '../../../util';

export default {
  data: new SlashCommandBuilder()
    .setName('show-subgenre-panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Prints the subgenre panel to the current channel')
    .addStringOption((option) => option
      .setName('embed-json')
      .setDescription('Embed to display for the subgenre panel message. Must be a valid JSON string.')
      .setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const roleOptions: ISelectableSubgenreRoleOption[] = await SelectableSubgenreRoleOption.find({
        guild_id: interaction.guild?.id,
      }).exec();

      if (roleOptions.length === 0) {
        sendResponse(interaction, `There are no subgenre roles added to the subgenre selection menu! 
        Cannot display the menu until there are roles added to the selection.
        First add some subgenre roles to the menu by slash commands!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      } else {
        const options = roleOptions.map((r) => ({
          label: interaction.guild?.roles.cache.get(r.subgenre_role_id)?.name ?? 'Unknown',
          value: r.subgenre_role_id,
          description: r.subgenre_description,
          emoji: r.subgenre_emoji,
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
            .setTitle('Select your subgenre! Deselect all of them to clear your preferences!');
        }

        const components = [
          new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(new StringSelectMenuBuilder()
              .setCustomId('reaction-subgenre')
              .setMinValues(0)
              .setMaxValues(roleOptions.length)
              .addOptions(options)
              .setPlaceholder('Select your subgenre preferences')),
        ];
        sendResponse(interaction, 'Subgenre menu is displayed successfully!', EmbedMessageType.Success, 'Could not send interaction message to user');
        interaction.channel!.send({
          embeds: [panelMsg],
          components,
        }).catch((e) => {
          errorLog('Could not send interaction message to user\n========================\n%O', e);
        });
      }
    } else {
      sendResponse(interaction, 'You do not have the permission to display the subgenre menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
