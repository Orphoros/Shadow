import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ISelectableColorRoleOption, SelectableColorRoleOption } from '../../../schemas';
import {
  isUserAuthorized, EmbedMessageType, sendResponse, sendCrashResponse,
} from '../../../util';

export default {
  data: new SlashCommandBuilder()
    .setName('add-selectable-color')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Add a role to the selectable colors list')
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('Role with a color to add to the selectable colors list')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('color-name')
      .setDescription('Name of the color')
      .setRequired(false))
    .addStringOption((option) => option
      .setName('color-emoji')
      .setDescription('Emoji that represents the color')
      .setRequired(false)),
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const role = interaction.options.getRole('role');
      const colorName = interaction.options.getString('color-name');
      const colorEmoji = interaction.options.getString('color-emoji');
      const guildID = interaction.guild?.id;

      const roleOption: ISelectableColorRoleOption | null = await SelectableColorRoleOption
        .findOne({
          color_role_id: role?.id,
          guild_id: guildID,
        }).exec();

      if (roleOption !== null) {
        sendResponse(interaction, `Color role <@&${role?.id}> is already added to the color selection menu! Cannot add it again`, EmbedMessageType.Warning, 'Could not send interaction message to user');
        return;
      }

      if (role!.position >= interaction.guild!.me!.roles.highest.position) {
        sendResponse(interaction, `Not possible to add color role <@&${role?.id}> to the color selection at the moment!\n
        The bot can only work with roles that are below its permission level!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      } else {
        await new SelectableColorRoleOption({
          color_role_id: role?.id,
          guild_id: guildID,
          color_description: colorName ?? undefined,
          color_emoji: colorEmoji ?? undefined,
        }).save().then(() => {
          sendResponse(interaction, `Color role <@&${role?.id}> is now added as a selectable color menu!\n
          Make sure to redisplay the color selector menu to make this change effective!`, EmbedMessageType.Success, 'Could not send interaction message to user');
        }).catch((e) => {
          sendCrashResponse(interaction, `Could not save color role <@&${role?.id}> to the remote database!`, e);
        });
      }
    } else {
      sendResponse(interaction, 'You do not have the permission to add color roles to the color selection menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
