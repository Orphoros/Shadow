import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ISelectableRegionRoleOption, SelectableRegionRoleOption } from '../../../schemas';
import {
  EmbedMessageType, isUserAuthorized, sendResponse, sendCrashResponse,
} from '../../../util';

export default {
  data: new SlashCommandBuilder()
    .setName('remove-selectable-region')
    .setDescription('Remove a region role from the selectable region list')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('Region role to remove from the selectable region list')
      .setRequired(true)),
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const role = interaction.options.getRole('role');

      const roleOption: ISelectableRegionRoleOption | null = await SelectableRegionRoleOption
        .findOne({
          region_role_id: role?.id,
          guild_id: interaction.guild?.id,
        }).exec();

      if (roleOption !== null) {
        SelectableRegionRoleOption.deleteOne({
          region_role_id: roleOption.region_role_id,
          guild_id: roleOption.guild_id,
        }).then(() => {
          sendResponse(interaction, `Region role <@&${role?.id}> is now removed from the selection!\n
          Remove the old menu and display a new menu to make this change affective!`, EmbedMessageType.Success, 'Could not send interaction message to user');
        }).catch((e) => {
          sendCrashResponse(interaction, `Could not delete region role <@&${role?.id}> from the remote database!`, e);
        });
      } else {
        sendResponse(interaction, `Cannot remove region role <@&${role?.id}>! This role is not added to the selection menu!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      }
    } else {
      sendResponse(interaction, 'You are not authorized to remove roles from the region role selection menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
