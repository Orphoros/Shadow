import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  isUserAuthorized, errorLog, EmbedMessageType, returnCrashMsg, returnEmbed,
} from '../../../util';
import { ISelectableColorRoleOption, SelectableColorRoleOption } from '../../../schemas';

export default {
  data: new SlashCommandBuilder()
    .setName('remove-selectable-color')
    .setDescription('Remove a color role from the selectable colors list')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('Color role to remove from the selectable colors list')
      .setRequired(true)),
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const role = interaction.options.getRole('role');

      const roleOption: ISelectableColorRoleOption | null = await SelectableColorRoleOption
        .findOne({
          color_role_id: role?.id,
          guild_id: interaction.guild?.id,
        }).exec();

      if (roleOption !== null) {
        SelectableColorRoleOption.deleteOne({
          color_role_id: roleOption.color_role_id,
          guild_id: roleOption.guild_id,
        }).then(() => {
          interaction.reply({
            embeds: [returnEmbed(`Color role <@&${role?.id}> is now removed from the color selection!\n
            Remove the old panel and display a new panel to make this change affective!`, EmbedMessageType.Success)],
            ephemeral: true,
          }).catch((e) => {
            errorLog('Could not send interaction message to user: %O', e);
          });
        }).catch((e) => {
          errorLog('Could not delete selectable color option: %O', e);
          interaction.reply({
            embeds: [returnCrashMsg(`Could not delete color role <@&${role?.id}> from the remote database!`, e)],
            ephemeral: true,
          }).catch((e2) => {
            errorLog('Could not send interaction message to user: %O', e2);
          });
        });
      } else {
        interaction.reply({
          embeds: [returnEmbed(`Cannot remove color role <@&${role?.id}>! This role is not added to the color selection!`, EmbedMessageType.Warning)],
          ephemeral: true,
        }).catch((e) => {
          errorLog('Could not send interaction message to user: %O', e);
        });
      }
    } else {
      interaction.reply({
        embeds: [returnEmbed('You cannot use this slash command!', EmbedMessageType.Error)],
        ephemeral: true,
      }).catch((e) => {
        errorLog('Could not send interaction message to user: %O', e);
      });
    }
  },
};
