import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ISelectablePingRoleOption, SelectablePingRoleOption } from '../../../schemas';
import {
  isUserAuthorized, EmbedMessageType, sendResponse, sendCrashResponse,
} from '../../../util';

export default {
  data: new SlashCommandBuilder()
    .setName('add-selectable-ping')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Add a ping role to the selectable ping list')
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('Ping role to add to the selectable ping list')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('description')
      .setDescription('Description of the ping')
      .setRequired(false))
    .addStringOption((option) => option
      .setName('emoji')
      .setDescription('Emoji that represents the ping')
      .setRequired(false)),
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const role = interaction.options.getRole('role');
      const roleDescription = interaction.options.getString('description');
      const roleEmoji = interaction.options.getString('emoji');
      const guildID = interaction.guild?.id;

      const roleOption: ISelectablePingRoleOption | null = await SelectablePingRoleOption
        .findOne({
          ping_role_id: role?.id,
          guild_id: guildID,
        }).exec();

      if (roleOption !== null) {
        sendResponse(interaction, `Ping role <@&${role?.id}> is already added to the ping selection menu! Cannot add it again`, EmbedMessageType.Warning, 'Could not send interaction message to user');
        return;
      }

      if (role!.position >= interaction.guild!.me!.roles.highest.position) {
        sendResponse(interaction, `Not possible to add ping role <@&${role?.id}> to the ping selection at the moment!\n
        The bot can only work with roles that are below its permission level!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      } else {
        await new SelectablePingRoleOption({
          ping_role_id: role?.id,
          guild_id: guildID,
          ping_description: roleDescription ?? undefined,
          ping_emoji: roleEmoji ?? undefined,
        }).save().then(() => {
          sendResponse(interaction, `Ping role <@&${role?.id}> is now added as a selectable ping option!\n
          Make sure to redisplay the ping selector menu to make this change effective!`, EmbedMessageType.Success, 'Could not send interaction message to user');
        }).catch((e) => {
          sendCrashResponse(interaction, `Could not save ping role <@&${role?.id}> to the remote database!`, e);
        });
      }
    } else {
      sendResponse(interaction, 'You do not have the permission to add roles to the ping selection menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
