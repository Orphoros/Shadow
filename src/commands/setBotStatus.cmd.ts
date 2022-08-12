import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction, PresenceStatusData,
} from 'discord.js';
import { ActivityTypes } from 'discord.js/typings/enums';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { DiscordClient } from '../typings/client';
import { BotStatusConfig } from '../schemas';
import {
  isUserAuthorized, EmbedMessageType, sendResponse, sendCrashResponse,
} from '../util';

export default {
  data: new SlashCommandBuilder()
    .setName('set-bot-status')
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
    .addIntegerOption((option) => option
      .setName('activity')
      .setRequired(true)
      .addChoices(
        { name: 'Playing', value: 1 },
        { name: 'Watching', value: 2 },
        { name: 'Listening', value: 3 },
      )
      .setDescription('Set what action the bot is doing'))
    .addStringOption((option) => option
      .setName('status')
      .setDescription('The status of the bot')
      .setRequired(true))
    .addIntegerOption((option) => option
      .setName('type')
      .setRequired(true)
      .addChoices(
        { name: 'Online', value: 1 },
        { name: 'Idle', value: 2 },
        { name: 'Do not disturb', value: 3 },
        { name: 'Invisible', value: 4 },
      )
      .setDescription('Set the availability appearance of the bot'))
    .setDescription('Set the status of the bot'),
  async execute(interaction: CommandInteraction<CacheType>, client: DiscordClient): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const statusMsg = interaction.options.getString('status');
      let type: PresenceStatusData;
      const typeNum = interaction.options.getInteger('type');
      switch (typeNum) {
        case 1:
          type = 'online';
          break;
        case 2:
          type = 'idle';
          break;
        case 3:
          type = 'dnd';
          break;
        case 4:
          type = 'invisible';
          break;
        default:
          type = 'online';
      }
      let activity: number;
      let activityName: string;
      switch (interaction.options.getInteger('activity')) {
        case 1:
          activity = ActivityTypes.PLAYING;
          activityName = 'playing';
          break;
        case 2:
          activity = ActivityTypes.WATCHING;
          activityName = 'watching';
          break;
        case 3:
          activity = ActivityTypes.LISTENING;
          activityName = 'listening';
          break;
        default:
          activity = ActivityTypes.PLAYING;
          activityName = 'playing';
      }

      BotStatusConfig.findByIdAndUpdate({ _id: 1 }, {
        status_type: typeNum,
        status_msg: statusMsg,
        status_activity: activity,
      })
        .then(() => {
          client.user?.setStatus(type);
          client.user?.setActivity(statusMsg!, { type: activity });
          sendResponse(interaction, `Bot status is now ${type} with message: ${activityName} ${statusMsg}`, EmbedMessageType.Info, 'Could not send interaction message to user');
        })
        .catch((e) => {
          sendCrashResponse(interaction, 'Could not set the new bot status with the database!', e);
        });
    } else {
      sendResponse(interaction, 'You are not authorized to set the status of the bot.', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
