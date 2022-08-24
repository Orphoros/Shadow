import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction, MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  isUserAuthorized, errorLog, EmbedMessageType, sendResponse, getBaseRoles,
} from '../util';

export default {
  data: new SlashCommandBuilder()
    .setName('show-rules-panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .setDescription('Prints the rules panel where users can accept the rules')
    .addStringOption((option) => option
      .setName('embed-json')
      .setDescription('Embed to display for the rules panel message. Must be a valid JSON string.')
      .setRequired(false)),
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const baseRoles = await getBaseRoles(interaction.guildId ?? '');

      if (baseRoles.length === 0) {
        sendResponse(interaction, `There are no base roles configured! 
        Cannot display the rules panel until there is at least one base role configured.
        First add some base roles to the bot config by slash commands!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
      } else {
        const embed = interaction.options.getString('embed-json');
        let panelMsg;

        if (embed) {
          try {
            panelMsg = JSON.parse(embed);
          } catch (e) {
            sendResponse(interaction, 'The embed JSON string is not valid!', EmbedMessageType.Error, 'Could not send interaction message to user');
            return;
          }
        } else {
          panelMsg = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Confirm that you have read the rules by clicking the button below!');
        }

        const components = [
          new MessageActionRow().addComponents(new MessageButton()
            .setCustomId('btn-accept-rules')
            .setLabel('I accept the rules')
            .setStyle('SUCCESS')),
        ];
        sendResponse(interaction, 'Rules panel is displayed successfully!', EmbedMessageType.Success, 'Could not send interaction message to user');
        interaction.channel!.send({
          embeds: [panelMsg],
          components,
        }).catch((e) => {
          errorLog('Could not send interaction message to user\n========================\n%O', e);
        });
      }
    } else {
      sendResponse(interaction, 'You do not have the permission to display the rules!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
