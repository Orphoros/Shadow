import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { CacheType, CommandInteraction } from 'discord.js';
import {
  EmbedMessageType, isUserAuthorized, sendCrashResponse, sendResponse,
} from '../../../util';
import { ISelectableDutyRoleOption, SelectableDutyRoleOption } from '../../../schemas';

export default {
  data: new SlashCommandBuilder()
    .setName('add-selectable-duty')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Add a duty role to the selectable duty list')
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('Duty role to add to the selectable duty list')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('description')
      .setDescription('Description of the duty')
      .setRequired(false))
    .addStringOption((option) => option
      .setName('emoji')
      .setDescription('Emoji that represents the duty')
      .setRequired(false)),

  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const role = interaction.options.getRole('role');
      const roleDescription = interaction.options.getString('description');
      const roleEmoji = interaction.options.getString('emoji');
      const guildID = interaction.guild?.id;

      const roleOption: ISelectableDutyRoleOption | null = await SelectableDutyRoleOption
        .findOne({
          duty_role_id: role?.id,
          guild_id: guildID,
        }).exec();

      if (roleOption !== null) {
        sendResponse(interaction, `Duty role <@&${role?.id}> is already added to the duty selection menu! Cannot add it again`, EmbedMessageType.Warning, 'Could not send interaction message to user');
        return;
      }

      if (role!.position >= interaction.guild!.me!.roles.highest.position) {
        sendResponse(interaction, `Not possible to add duty role <@&${role?.id}> to the duty selection at the moment!\n
          The bot can only work with roles that are below its permission level!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      } else {
        await new SelectableDutyRoleOption({
          duty_role_id: role?.id,
          guild_id: guildID,
          duty_description: roleDescription ?? undefined,
          duty_emoji: roleEmoji ?? undefined,
        }).save().then(() => {
          sendResponse(interaction, `Duty role <@&${role?.id}> is now added as a selectable duty option!\n
          Make sure to redisplay the duty selector menu to make this change effective!`, EmbedMessageType.Success, 'Could not send interaction message to user');
        }).catch((e) => {
          sendCrashResponse(interaction, `Could not save duty role <@&${role?.id}> to the remote database!`, e);
        });
      }
    } else {
      sendResponse(interaction, 'You do not have the permission to add roles to the duty selection menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
