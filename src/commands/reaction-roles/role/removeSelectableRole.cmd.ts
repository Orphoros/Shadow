import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ISelectableRoleOption, SelectableRoleOption } from '../../../schemas';
import {
  EmbedMessageType, isUserAuthorized, sendResponse, sendCrashResponse,
} from '../../../util';

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
          sendResponse(interaction, `Role <@&${role?.id}> is now removed from the selection!\n
          Remove the old panel and display a new panel to make this change affective!`, EmbedMessageType.Success, 'Could not send interaction message to user');
        }).catch((e) => {
          sendCrashResponse(interaction, `Could not delete role <@&${role?.id}> from the remote database!`, e);
        });
      } else {
        sendResponse(interaction, `Cannot remove role <@&${role?.id}>! This role is not added to the selection!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      }
    } else {
      sendResponse(interaction, 'You are not authorized to use this command!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
