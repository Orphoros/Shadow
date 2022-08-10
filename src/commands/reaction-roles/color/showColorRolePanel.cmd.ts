import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction, MessageActionRow,
  MessageEmbed, MessageSelectMenu,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ISelectableColorRoleOption, SelectableColorRoleOption } from '../../../schemas';
import { EmbedMessageType, returnEmbed } from '../../../util/responseGiver';
import { errorLog } from '../../../util/dbg';
import { isUserAuthorized } from '../../../util/mongoIO';

export default {
  data: new SlashCommandBuilder()
    .setName('show-color-panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Prints the selectable color panel to the current channel'),
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const roleOptions: ISelectableColorRoleOption[] = await SelectableColorRoleOption.find({
        guild_id: interaction.guild?.id,
      }).exec();

      if (roleOptions.length === 0) {
        interaction.reply({
          embeds: [returnEmbed(`There are no colors added to the color selection! 
          Cannot display the panel till there are roles added to the color selection list.
          First add some roles to the panel by slash commands!`, EmbedMessageType.Error)],
          ephemeral: true,
        }).catch((e) => {
          errorLog('Could not send interaction message to user: %O', e);
        });
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

        const panelMsg = new MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Select your color from the list below');
        const components = [
          new MessageActionRow().addComponents(new MessageSelectMenu()
            .setCustomId('reaction-colors')
            .setMaxValues(1)
            .setMinValues(1)
            .addOptions(options)
            .setPlaceholder('Select a color')),
        ];
        interaction.reply({
          embeds: [returnEmbed('Color panel displayed successfully!', EmbedMessageType.Success)],
          ephemeral: true,
        }).catch((e) => {
          errorLog('Could not send interaction message to user: %O', e);
        });
        interaction.channel!.send({
          embeds: [panelMsg],
          components,
        }).catch((e) => {
          errorLog('Could not send interaction message to user: %O', e);
        });
      }
    } else {
      interaction.reply({
        embeds: [returnEmbed('You do not have the permission to display Color Role Panels!', EmbedMessageType.Error)],
        ephemeral: true,
      }).catch((e) => {
        errorLog('Could not send interaction message to user: %O', e);
      });
    }
  },
};
