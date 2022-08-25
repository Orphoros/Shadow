import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ISelectableDMRoleOption, SelectableDMRoleOption } from '../../../schemas';
import {
  EmbedMessageType, isUserAuthorized, sendResponse, sendCrashResponse,
} from '../../../util';

export default {
  data: new SlashCommandBuilder()
    .setName('remove-selectable-age')
    .setDescription('Remove an dm role from the selectable dm list')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('DM role to remove from the selectable dm list')
      .setRequired(true)),
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const role = interaction.options.getRole('role');

      const roleOption: ISelectableDMRoleOption | null = await SelectableDMRoleOption.findOne({
        dm_role_id: role?.id,
        guild_id: interaction.guild?.id,
      }).exec();

      if (roleOption !== null) {
        SelectableDMRoleOption.deleteOne({
          dm_role_id: roleOption.dm_role_id,
          guild_id: roleOption.guild_id,
        }).then(() => {
          sendResponse(interaction, `DM role <@&${role?.id}> is now removed from the selection!\n
          Remove the old menu and display a new menu to make this change affective!`, EmbedMessageType.Success, 'Could not send interaction message to user');
        }).catch((e) => {
          sendCrashResponse(interaction, `Could not delete dm role <@&${role?.id}> from the remote database!`, e);
        });
      } else {
        sendResponse(interaction, `Cannot remove dm role <@&${role?.id}>! This role is not added to the selection menu!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      }
    } else {
      sendResponse(interaction, 'You are not authorized to remove dm roles from the dm role selection menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
