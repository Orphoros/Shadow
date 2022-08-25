import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ISelectablePronounRoleOption, SelectablePronounRoleOption } from '../../../schemas';
import {
  isUserAuthorized, EmbedMessageType, sendResponse, sendCrashResponse,
} from '../../../util';

export default {
  data: new SlashCommandBuilder()
    .setName('add-selectable-pronoun')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Add a pronoun role to the selectable pronoun list')
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('Pronoun role to add to the selectable pronoun list')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('description')
      .setDescription('Description of the pronoun')
      .setRequired(false))
    .addStringOption((option) => option
      .setName('emoji')
      .setDescription('Emoji that represents the pronoun')
      .setRequired(false)),
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const role = interaction.options.getRole('role');
      const roleDescription = interaction.options.getString('description');
      const roleEmoji = interaction.options.getString('emoji');
      const guildID = interaction.guild?.id;

      const roleOption: ISelectablePronounRoleOption | null = await SelectablePronounRoleOption
        .findOne({
          pronoun_role_id: role?.id,
          guild_id: guildID,
        }).exec();

      if (roleOption !== null) {
        sendResponse(interaction, `Pronoun role <@&${role?.id}> is already added to the pronoun selection menu! Cannot add it again`, EmbedMessageType.Warning, 'Could not send interaction message to user');
        return;
      }

      if (role!.position >= interaction.guild!.me!.roles.highest.position) {
        sendResponse(interaction, `Not possible to add pronoun role <@&${role?.id}> to the pronoun selection at the moment!\n
        The bot can only work with roles that are below its permission level!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      } else {
        await new SelectablePronounRoleOption({
          pronoun_role_id: role?.id,
          guild_id: guildID,
          pronoun_description: roleDescription ?? undefined,
          pronoun_emoji: roleEmoji ?? undefined,
        }).save().then(() => {
          sendResponse(interaction, `Pronoun role <@&${role?.id}> is now added as a selectable pronoun menu!\n
          Make sure to redisplay the pronoun selector menu to make this change effective!`, EmbedMessageType.Success, 'Could not send interaction message to user');
        }).catch((e) => {
          sendCrashResponse(interaction, `Could not save pronoun role <@&${role?.id}> to the remote database!`, e);
        });
      }
    } else {
      sendResponse(interaction, 'You do not have the permission to add roles to the pronoun selection menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
