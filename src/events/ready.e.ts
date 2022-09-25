import mongoose from 'mongoose';
import { PresenceStatusData } from 'discord.js';
import { initAutoVCHandler } from '../handlers/autoVCHandler';
import { DiscordClient } from '../typings/client';
import {
  shutdown, bootLog, errorLog,
} from '../util';
import { IBotStatusConfig, BotStatusConfig } from '../schemas';

export default (client: DiscordClient): void => {
  client.on('ready', async () => {
    if (!client.user || !client.application) {
      return;
    }

    client.user?.setStatus('idle');
    client.user?.setActivity('boot sequence', { type: 'WATCHING' });

    if (!process.env.MONGO_URI || process.env.MONGO_URI === '') {
      errorLog('MONGO_URI is not set!');
      shutdown(client);
      return;
    }

    await mongoose.connect(process.env.MONGO_URI, {
      keepAlive: true,
    })
      .then(() => {
        bootLog('Connected to MongoDB!');
      })
      .catch((e) => {
        errorLog('Could not connect to MongoDB: %O', e);
        shutdown(client, 1);
      });

    try {
      initAutoVCHandler(client);
      bootLog('AutoVCHandler initialized!');
      // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
      let commandHandler = require('../handlers/commandHandler');
      if (commandHandler.default) commandHandler = commandHandler.default;
      commandHandler(client, 1);
    } catch (e) {
      errorLog('Could not invoke the command handler: %O', e);
    }

    const status: IBotStatusConfig | null = await BotStatusConfig.findById({
      _id: 1,
    }).exec();

    if (status) {
      bootLog('Bot status loaded');
      let statusType: PresenceStatusData;
      switch (status.status_type) {
        case 1:
          statusType = 'online';
          break;
        case 2:
          statusType = 'idle';
          break;
        case 3:
          statusType = 'dnd';
          break;
        case 4:
          statusType = 'invisible';
          break;
        default:
          errorLog('Received invalid status type from the database: %o', status.status_type);
          statusType = 'online';
      }
      bootLog('Setting bot status to: %o - %o - %o', statusType, status.status_activity, status.status_msg);
      client.user?.setStatus(statusType);
      client.user?.setActivity(status.status_msg!, { type: status.status_activity! });
    } else {
      await new BotStatusConfig({
        _id: 1,
        status_type: 1,
        status_msg: 'to people',
        status_activity: 2,
      })
        .save().then(() => {
          bootLog('Bot status record created!');
          client.user?.setStatus('online');
          client.user?.setActivity('to people', { type: 2 });
        })
        .catch((e) => {
          errorLog('Could not save the bot status config: %O', e);
          client.user?.setStatus('online');
          client.user?.setActivity('to people', { type: 'LISTENING' });
        });
    }

    bootLog('Bot is now online!');
  });
};
