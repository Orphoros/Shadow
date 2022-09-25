import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  isUserAuthorized, EmbedMessageType, sendResponse, sendCrashResponse,
} from '../../../util';
import { ISelectableRegionRoleOption, SelectableRegionRoleOption } from '../../../schemas';

export default {
  data: new SlashCommandBuilder()
    .setName('add-selectable-region')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Add a role to the selectable region list')
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('Role to add to the selectable region list')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('description')
      .setDescription('Description of the region role')
      .setRequired(false))
    .addStringOption((option) => option
      .setName('emoji')
      .setDescription('Emoji to display in the list of region roles')
      .setRequired(false)),
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const role = interaction.options.getRole('role');
      const description = interaction.options.getString('description');
      const emoji = interaction.options.getString('emoji');
      const guildID = interaction.guild?.id;

      const numOfRoles = await SelectableRegionRoleOption.countDocuments({
        guild_id: guildID,
      }).exec();

      if (numOfRoles >= 25) {
        sendResponse(interaction, 'You can only add 25 options to one selection menu! The maximum amount of options has been already reached!', EmbedMessageType.Warning, 'Could not send interaction message to user');
        return;
      }

      const roleOption: ISelectableRegionRoleOption | null = await SelectableRegionRoleOption
        .findOne({
          region_role_id: role?.id,
          guild_id: guildID,
        }).exec();

      if (roleOption !== null) {
        sendResponse(interaction, `Region role <@&${role?.id}> is already added to the region role selection menu!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
        return;
      }

      if (role!.position >= interaction.guild!.me!.roles.highest.position) {
        sendResponse(interaction, `Not possible add <@&${role?.id}> to the selection at the moment!\n
        The bot can only work with roles that are below its permission level!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      } else {
        await new SelectableRegionRoleOption({
          region_role_id: role?.id,
          guild_id: guildID,
          region_description: description ?? undefined,
          region_emoji: emoji ?? undefined,
        }).save().then(() => {
          sendResponse(interaction, `Region role <@&${role?.id}> is now added to the dropdown menu as a selectable role!\n
          Make sure to redisplay the panel to make this change effective!`, EmbedMessageType.Success, 'Could not send interaction message to user');
        }).catch((e) => {
          sendCrashResponse(interaction, `Could not save region role <@&${role?.id}> to the remote database!`, e);
        });
      }
    } else {
      sendResponse(interaction, 'You are not authorized to add roles to the region role selection panel!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
