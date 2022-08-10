import { Client, Intents } from 'discord.js';
import * as dotenv from 'dotenv';
import { DiscordClient } from './typings/client';
import eventHandler from './handlers/eventHandler';
import { bootLog } from './util';

dotenv.config();

const init = async () => {
  bootLog('Bot is starting...');

  const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_VOICE_STATES,
      Intents.FLAGS.GUILD_PRESENCES,
      Intents.FLAGS.GUILD_MEMBERS,
    ],
  }) as DiscordClient;

  eventHandler(client);

  client.login(process.env.BOT_TOKEN);
};

init();
