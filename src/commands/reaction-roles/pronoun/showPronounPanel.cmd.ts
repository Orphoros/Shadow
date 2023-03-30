import { SlashCommandBuilder } from '@discordjs/builders';
import {
  ActionRowBuilder,
  CacheType, ChatInputCommandInteraction,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ISelectablePronounRoleOption, SelectablePronounRoleOption } from '../../../schemas';
import {
  isUserAuthorized, errorLog, EmbedMessageType, sendResponse,
} from '../../../util';

export default {
  data: new SlashCommandBuilder()
    .setName('show-pronoun-panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Prints the pronoun panel to the current channel')
    .addStringOption((option) => option
      .setName('embed-json')
      .setDescription('Embed to display for the pronoun panel message. Must be a valid JSON string.')
      .setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const roleOptions: ISelectablePronounRoleOption[] = await SelectablePronounRoleOption.find({
        guild_id: interaction.guild?.id,
      }).exec();

      if (roleOptions.length === 0) {
        sendResponse(interaction, `There are no pronoun roles added to the pronoun selection menu! 
        Cannot display the menu until there are roles added to the selection.
        First add some pronoun roles to the menu by slash commands!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      } else {
        const options = roleOptions.map((r) => ({
          label: interaction.guild?.roles.cache.get(r.pronoun_role_id)?.name ?? 'Unknown',
          value: r.pronoun_role_id,
          description: r.pronoun_description,
          emoji: r.pronoun_emoji,
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
            .setTitle('Select your pronoun(s)! Deselect all of them to clear your preferences!');
        }

        const components = [
          new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(new StringSelectMenuBuilder()
              .setCustomId('reaction-pronoun')
              .setMinValues(0)
              .setMaxValues(roleOptions.length)
              .addOptions(options)
              .setPlaceholder('Select your pronoun preferences')),
        ];
        sendResponse(interaction, 'Pronoun menu is displayed successfully!', EmbedMessageType.Success, 'Could not send interaction message to user');
        interaction.channel!.send({
          embeds: [panelMsg],
          components,
        }).catch((e) => {
          errorLog('Could not send interaction message to user\n========================\n%O', e);
        });
      }
    } else {
      sendResponse(interaction, 'You do not have the permission to display the pronoun menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
