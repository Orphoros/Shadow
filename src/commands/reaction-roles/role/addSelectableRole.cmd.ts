import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { isUserAuthorized } from '../../../util/mongoIO';
import { ISelectableRoleOption, SelectableRoleOption } from '../../../schemas/selectableRoleOption';
import { EmbedMessageType, returnCrashMsg, returnEmbed } from '../../../util/responseGiver';
import { errorLog } from '../../../util/dbg';

export default {
  data: new SlashCommandBuilder()
    .setName('add-selectable-role')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Add a role to the selectable roles list')
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('Role to add to the selectable roles list')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('description')
      .setDescription('Description of the role')
      .setRequired(false))
    .addStringOption((option) => option
      .setName('emoji')
      .setDescription('Emoji to display in the list of roles')
      .setRequired(false)),
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const role = interaction.options.getRole('role');
      const description = interaction.options.getString('description');
      const emoji = interaction.options.getString('emoji');
      const guildID = interaction.guild?.id;

      const roleOption: ISelectableRoleOption | null = await SelectableRoleOption.findOne({
        role_id: role?.id,
        guild_id: guildID,
      }).exec();

      if (roleOption !== null) {
        interaction.reply({
          embeds: [returnEmbed(`Role <@&${role?.id}> is already added to the selection!`, EmbedMessageType.Error)],
          ephemeral: true,
        }).catch((e) => {
          errorLog('Could not send interaction message to user: %O', e);
        });
        return;
      }

      if (role!.position >= interaction.guild!.me!.roles.highest.position) {
        interaction.reply({
          embeds: [returnEmbed(`Not possible add <@&${role?.id}> to the selection at the moment!\n
          The bot can only work with roles that are below its permission level!`, EmbedMessageType.Warning)],
          ephemeral: true,
        }).catch((e) => {
          errorLog('Could not send interaction message to user: %O', e);
        });
      } else {
        await new SelectableRoleOption({
          role_id: role?.id,
          guild_id: guildID,
          role_description: description ?? undefined,
          role_emoji: emoji ?? undefined,
        }).save().then(() => {
          interaction.reply({
            embeds: [returnEmbed(`Role <@&${role?.id}> is now added as a selectable role to the dropdown menu!\n
            Make sure to redisplay the panel to make this change effective!`, EmbedMessageType.Success)],
            ephemeral: true,
          }).catch((e) => {
            errorLog('Could not send interaction message to user: %O', e);
          });
        }).catch((e) => {
          errorLog('Could not save selectable role option: %O', e);
          interaction.reply({
            embeds: [returnCrashMsg(`Could not save role <@&${role?.id}> to the remote database!`, e)],
            ephemeral: true,
          }).catch((e2) => {
            errorLog('Could not send interaction message to user: %O', e2);
          });
        });
      }
    } else {
      interaction.reply({
        embeds: [returnEmbed('You cannot add roles to the role selection panel!', EmbedMessageType.Error)],
        ephemeral: true,
      }).catch((e) => {
        errorLog('Could not send interaction message to user: %O', e);
      });
    }
  },
};