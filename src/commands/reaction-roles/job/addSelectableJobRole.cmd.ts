import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, ChatInputCommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ISelectableJobRoleOption, SelectableJobRoleOption } from '../../../schemas';
import {
  isUserAuthorized, EmbedMessageType, sendResponse, sendCrashResponse,
} from '../../../util';

export default {
  data: new SlashCommandBuilder()
    .setName('add-selectable-job')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Add a job role to the selectable job list')
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('Job role to add to the selectable job list')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('description')
      .setDescription('Description of the job')
      .setRequired(false))
    .addStringOption((option) => option
      .setName('emoji')
      .setDescription('Emoji that represents the job')
      .setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const role = interaction.options.getRole('role');
      const roleDescription = interaction.options.getString('description');
      const roleEmoji = interaction.options.getString('emoji');
      const guildID = interaction.guild?.id;

      const numOfRoles = await SelectableJobRoleOption.countDocuments({
        guild_id: guildID,
      }).exec();

      if (numOfRoles >= 25) {
        sendResponse(interaction, 'You can only add 25 options to one selection menu! The maximum amount of options has been already reached!', EmbedMessageType.Warning, 'Could not send interaction message to user');
        return;
      }

      const roleOption: ISelectableJobRoleOption | null = await SelectableJobRoleOption
        .findOne({
          job_role_id: role?.id,
          guild_id: guildID,
        }).exec();

      if (roleOption !== null) {
        sendResponse(interaction, `Job role <@&${role?.id}> is already added to the job selection menu! Cannot add it again`, EmbedMessageType.Warning, 'Could not send interaction message to user');
        return;
      }

      if (role!.position >= interaction.guild!.members.me!.roles.highest.position) {
        sendResponse(interaction, `Not possible to add job role <@&${role?.id}> to the job selection at the moment!\n
        The bot can only work with roles that are below its permission level!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      } else {
        await new SelectableJobRoleOption({
          job_role_id: role?.id,
          guild_id: guildID,
          job_description: roleDescription ?? undefined,
          job_emoji: roleEmoji ?? undefined,
        }).save().then(() => {
          sendResponse(interaction, `Job role <@&${role?.id}> is now added as a selectable job option!\n
          Make sure to redisplay the job selector menu to make this change effective!`, EmbedMessageType.Success, 'Could not send interaction message to user');
        }).catch((e) => {
          sendCrashResponse(interaction, `Could not save job role <@&${role?.id}> to the remote database!`, e);
        });
      }
    } else {
      sendResponse(interaction, 'You do not have the permission to add roles to the job selection menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
