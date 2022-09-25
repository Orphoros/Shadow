import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  isUserAuthorized, EmbedMessageType, sendResponse, sendCrashResponse,
} from '../../../util';
import { ISelectableDMRoleOption, SelectableDMRoleOption } from '../../../schemas';

export default {
  data: new SlashCommandBuilder()
    .setName('add-selectable-dm')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Add a role to the selectable dm list')
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('Role to add to the selectable dm list')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('description')
      .setDescription('Description of the dm role')
      .setRequired(false))
    .addStringOption((option) => option
      .setName('emoji')
      .setDescription('Emoji to display in the list of dm roles')
      .setRequired(false)),
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const role = interaction.options.getRole('role');
      const description = interaction.options.getString('description');
      const emoji = interaction.options.getString('emoji');
      const guildID = interaction.guild?.id;

      const roleOption: ISelectableDMRoleOption | null = await SelectableDMRoleOption.findOne({
        dm_role_id: role?.id,
        guild_id: guildID,
      }).exec();

      if (roleOption !== null) {
        sendResponse(interaction, `DM role <@&${role?.id}> is already added to the dm role selection menu!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
        return;
      }

      if (role!.position >= interaction.guild!.me!.roles.highest.position) {
        sendResponse(interaction, `Not possible add <@&${role?.id}> to the selection at the moment!\n
        The bot can only work with roles that are below its permission level!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      } else {
        await new SelectableDMRoleOption({
          dm_role_id: role?.id,
          guild_id: guildID,
          dm_description: description ?? undefined,
          dm_emoji: emoji ?? undefined,
        }).save().then(() => {
          sendResponse(interaction, `DM role <@&${role?.id}> is now added as a selectable DM option!\n
          Make sure to redisplay the panel to make this change effective!`, EmbedMessageType.Success, 'Could not send interaction message to user');
        }).catch((e) => {
          sendCrashResponse(interaction, `Could not save dm role <@&${role?.id}> to the remote database!`, e);
        });
      }
    } else {
      sendResponse(interaction, 'You are not authorized to add dm roles to the dm role selection menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
