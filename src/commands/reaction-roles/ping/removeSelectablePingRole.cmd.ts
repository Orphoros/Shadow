import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, ChatInputCommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  isUserAuthorized, EmbedMessageType, sendResponse, sendCrashResponse,
} from '../../../util';
import { ISelectablePingRoleOption, SelectablePingRoleOption } from '../../../schemas';

export default {
  data: new SlashCommandBuilder()
    .setName('remove-selectable-ping')
    .setDescription('Remove a ping role from the selectable ping list')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('Ping role to remove from the selectable ping list')
      .setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const role = interaction.options.getRole('role');

      const roleOption: ISelectablePingRoleOption | null = await SelectablePingRoleOption
        .findOne({
          ping_role_id: role?.id,
          guild_id: interaction.guild?.id,
        }).exec();

      if (roleOption !== null) {
        SelectablePingRoleOption.deleteOne({
          ping_role_id: roleOption.ping_role_id,
          guild_id: roleOption.guild_id,
        }).then(() => {
          sendResponse(interaction, `Ping role <@&${role?.id}> is now removed from the ping selection menu!\n
          Remove the old menu and display a new menu to make this change affective!`, EmbedMessageType.Success, 'Could not send interaction message to user');
        }).catch((e) => {
          sendCrashResponse(interaction, `Could not delete ping role <@&${role?.id}> from the remote database!`, e);
        });
      } else {
        sendResponse(interaction, `Cannot remove ping role <@&${role?.id}>! This role is not added to the ping selection menu!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      }
    } else {
      sendResponse(interaction, 'You are not authorized to remove roles from the ping menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
