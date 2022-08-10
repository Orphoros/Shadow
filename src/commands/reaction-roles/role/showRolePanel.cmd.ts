import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction, MessageActionRow,
  MessageEmbed, MessageSelectMenu,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ISelectableRoleOption, SelectableRoleOption } from '../../../schemas';
import {
  isUserAuthorized, errorLog, EmbedMessageType, sendResponse,
} from '../../../util';

export default {
  data: new SlashCommandBuilder()
    .setName('show-role-panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Prints the role panel to the current channel'),
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const roleOptions: ISelectableRoleOption[] = await SelectableRoleOption.find({
        guild_id: interaction.guild?.id,
      }).exec();

      if (roleOptions.length === 0) {
        sendResponse(interaction, `There are no roles added to the selection! 
        Cannot display the panel till there are roles added to the selection.
        First add some roles to the panel by slash commands!`, EmbedMessageType.Error, 'Could not send interaction message to user');
      } else {
        const options = roleOptions.map((r) => ({
          label: interaction.guild?.roles.cache.get(r.role_id)?.name ?? 'Unknown',
          value: r.role_id,
          description: r.role_description,
          emoji: r.role_emoji,
        }));

        const panelMsg = new MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Select your roles from the list below! Deselect all roles to clear your roles!');
        const components = [
          new MessageActionRow().addComponents(new MessageSelectMenu()
            .setCustomId('reaction-roles')
            .setMinValues(0)
            .setMaxValues(roleOptions.length)
            .addOptions(options)
            .setPlaceholder('Select your roles')),
        ];
        sendResponse(interaction, 'Role panel displayed successfully!', EmbedMessageType.Success, 'Could not send interaction message to user');
        interaction.channel!.send({
          embeds: [panelMsg],
          components,
        }).catch((e) => {
          errorLog('Could not send interaction message to user\n========================\n%O', e);
        });
      }
    } else {
      sendResponse(interaction, 'You do not have the permission to display Role Panels!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
