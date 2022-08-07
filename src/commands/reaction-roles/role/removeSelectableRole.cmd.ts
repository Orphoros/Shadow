import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { isUserAuthorized } from '../../../util/mongoIO';
import { EmbedMessageType, returnCrashMsg, returnEmbed } from '../../../util/responseGiver';
import { ISelectableRoleOption, SelectableRoleOption } from '../../../schemas/selectableRoleOption';
import { errorLog } from '../../../util/dbg';

export default {
  data: new SlashCommandBuilder()
    .setName('remove-selectable-role')
    .setDescription('Remove a role from the selectable roles list')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('Role to remove from the selectable roles list')
      .setRequired(true)),
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const role = interaction.options.getRole('role');

      const roleOption: ISelectableRoleOption | null = await SelectableRoleOption.findOne({
        role_id: role?.id,
        guild_id: interaction.guild?.id,
      }).exec();

      if (roleOption !== null) {
        SelectableRoleOption.deleteOne({
          role_id: roleOption.role_id,
          guild_id: roleOption.guild_id,
        }).then(() => {
          interaction.reply({
            embeds: [returnEmbed(`Role <@&${role?.id}> is now removed from the selection!\n
            Remove the old panel and display a new panel to make this change affective!`, EmbedMessageType.Success)],
            ephemeral: true,
          }).catch((e) => {
            errorLog('Could not send interaction message to user: %O', e);
          });
        }).catch((e) => {
          errorLog('Could not delete selectable role option: %O', e);
          interaction.reply({
            embeds: [returnCrashMsg(`Could not delete role <@&${role?.id}> from the remote database!`, e)],
            ephemeral: true,
          }).catch((e2) => {
            errorLog('Could not send interaction message to user: %O', e2);
          });
        });
      } else {
        interaction.reply({
          embeds: [returnEmbed(`Cannot remove role <@&${role?.id}>! This role is not added to the selection!`, EmbedMessageType.Warning)],
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
