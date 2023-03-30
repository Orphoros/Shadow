import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, ChatInputCommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ISelectableAgeRoleOption, SelectableAgeRoleOption } from '../../../schemas';
import {
  EmbedMessageType, isUserAuthorized, sendResponse, sendCrashResponse,
} from '../../../util';

export default {
  data: new SlashCommandBuilder()
    .setName('remove-selectable-age')
    .setDescription('Remove an age role from the selectable age list')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('Age role to remove from the selectable age list')
      .setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const role = interaction.options.getRole('role');

      const roleOption: ISelectableAgeRoleOption | null = await SelectableAgeRoleOption.findOne({
        age_role_id: role?.id,
        guild_id: interaction.guild?.id,
      }).exec();

      if (roleOption !== null) {
        SelectableAgeRoleOption.deleteOne({
          age_role_id: roleOption.age_role_id,
          guild_id: roleOption.guild_id,
        }).then(() => {
          sendResponse(interaction, `Age role <@&${role?.id}> is now removed from the selection!\n
          Remove the old menu and display a new menu to make this change affective!`, EmbedMessageType.Success, 'Could not send interaction message to user');
        }).catch((e) => {
          sendCrashResponse(interaction, `Could not delete age role <@&${role?.id}> from the remote database!`, e);
        });
      } else {
        sendResponse(interaction, `Cannot remove age role <@&${role?.id}>! This role is not added to the selection menu!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      }
    } else {
      sendResponse(interaction, 'You are not authorized to remove roles from the age role selection menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
