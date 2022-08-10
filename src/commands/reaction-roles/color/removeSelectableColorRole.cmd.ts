import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  isUserAuthorized, errorLog, EmbedMessageType, returnCrashMsg, sendResponse,
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
          sendResponse(interaction, `Color role <@&${role?.id}> is now removed from the color selection!\n
          Remove the old panel and display a new panel to make this change affective!`, EmbedMessageType.Success, 'Could not send interaction message to user');
        }).catch((e) => {
          errorLog('Could not delete selectable color option\n========================\n%O', e);
          interaction.reply({
            embeds: [returnCrashMsg(`Could not delete color role <@&${role?.id}> from the remote database!`, e)],
            ephemeral: true,
          }).catch((e2) => {
            errorLog('Could not send interaction message to user\n========================\n%O', e2);
          });
        });
      } else {
        sendResponse(interaction, `Cannot remove color role <@&${role?.id}>! This role is not added to the color selection!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      }
    } else {
      sendResponse(interaction, 'You are not authorized to use this command!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
