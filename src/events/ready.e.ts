import mongoose from 'mongoose';
import { PresenceStatusData } from 'discord.js';
import { bootLog, errorLog } from '../util/dbg';
import { DiscordClient } from '../typings/client';
import shutdown from '../util/shutdown';
import { IBotStatusConfig, BotStatusConfig } from '../schemas/botStatus';

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
          statusType = 'online';
      }
      client.user?.setStatus(statusType);
      client.user?.setActivity(status.status_msg!, { type: status.status_activity! });
      bootLog('Bot status loaded');
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
