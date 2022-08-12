import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  isUserAuthorized, EmbedMessageType, sendResponse, sendCrashResponse,
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
          sendResponse(interaction, `Color role <@&${role?.id}> is now removed from the color selection menu!\n
          Remove the old menu and display a new menu to make this change affective!`, EmbedMessageType.Success, 'Could not send interaction message to user');
        }).catch((e) => {
          sendCrashResponse(interaction, `Could not delete color role <@&${role?.id}> from the remote database!`, e);
        });
      } else {
        sendResponse(interaction, `Cannot remove color role <@&${role?.id}>! This role is not added to the color selection menu!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      }
    } else {
      sendResponse(interaction, 'You are not authorized to remove color roles from the color menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
