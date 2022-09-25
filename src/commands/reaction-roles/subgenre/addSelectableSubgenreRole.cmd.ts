import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ISelectableSubgenreRoleOption, SelectableSubgenreRoleOption } from '../../../schemas';
import {
  isUserAuthorized, EmbedMessageType, sendResponse, sendCrashResponse,
} from '../../../util';

export default {
  data: new SlashCommandBuilder()
    .setName('add-selectable-subgenre')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Add a subgenre role to the selectable subgenre list')
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('Subgenre role to add to the selectable subgenre list')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('description')
      .setDescription('Description of the subgenre')
      .setRequired(false))
    .addStringOption((option) => option
      .setName('emoji')
      .setDescription('Emoji that represents the subgenre')
      .setRequired(false)),
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const role = interaction.options.getRole('role');
      const roleDescription = interaction.options.getString('description');
      const roleEmoji = interaction.options.getString('emoji');
      const guildID = interaction.guild?.id;

      const roleOption: ISelectableSubgenreRoleOption | null = await SelectableSubgenreRoleOption
        .findOne({
          subgenre_role_id: role?.id,
          guild_id: guildID,
        }).exec();

      if (roleOption !== null) {
        sendResponse(interaction, `Subgenre role <@&${role?.id}> is already added to the subgenre selection menu! Cannot add it again`, EmbedMessageType.Warning, 'Could not send interaction message to user');
        return;
      }

      if (role!.position >= interaction.guild!.me!.roles.highest.position) {
        sendResponse(interaction, `Not possible to add subgenre role <@&${role?.id}> to the subgenre selection at the moment!\n
        The bot can only work with roles that are below its permission level!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      } else {
        await new SelectableSubgenreRoleOption({
          subgenre_role_id: role?.id,
          guild_id: guildID,
          subgenre_description: roleDescription ?? undefined,
          subgenre_emoji: roleEmoji ?? undefined,
        }).save().then(() => {
          sendResponse(interaction, `Subgenre role <@&${role?.id}> is now added as a selectable subgenre option!\n
          Make sure to redisplay the subgenre selector menu to make this change effective!`, EmbedMessageType.Success, 'Could not send interaction message to user');
        }).catch((e) => {
          sendCrashResponse(interaction, `Could not save subgenre role <@&${role?.id}> to the remote database!`, e);
        });
      }
    } else {
      sendResponse(interaction, 'You do not have the permission to add roles to the subgenre selection menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
