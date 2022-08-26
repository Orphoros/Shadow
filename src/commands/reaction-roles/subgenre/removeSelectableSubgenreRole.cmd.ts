import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  isUserAuthorized, EmbedMessageType, sendResponse, sendCrashResponse,
} from '../../../util';
import { ISelectableSubgenreRoleOption, SelectableSubgenreRoleOption } from '../../../schemas';

export default {
  data: new SlashCommandBuilder()
    .setName('remove-selectable-subgenre')
    .setDescription('Remove a subgenre role from the selectable subgenre list')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('Subgenre role to remove from the selectable subgenre list')
      .setRequired(true)),
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const role = interaction.options.getRole('role');

      const roleOption: ISelectableSubgenreRoleOption | null = await SelectableSubgenreRoleOption
        .findOne({
          subgenre_role_id: role?.id,
          guild_id: interaction.guild?.id,
        }).exec();

      if (roleOption !== null) {
        SelectableSubgenreRoleOption.deleteOne({
          subgenre_role_id: roleOption.subgenre_role_id,
          guild_id: roleOption.guild_id,
        }).then(() => {
          sendResponse(interaction, `Subgenre role <@&${role?.id}> is now removed from the subgenre selection menu!\n
          Remove the old menu and display a new menu to make this change affective!`, EmbedMessageType.Success, 'Could not send interaction message to user');
        }).catch((e) => {
          sendCrashResponse(interaction, `Could not delete subgenre role <@&${role?.id}> from the remote database!`, e);
        });
      } else {
        sendResponse(interaction, `Cannot remove subgenre role <@&${role?.id}>! This role is not added to the subgenre selection menu!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      }
    } else {
      sendResponse(interaction, 'You are not authorized to remove roles from the subgenre menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
