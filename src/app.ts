import { Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import { DiscordClient } from './typings/client';
import eventHandler from './handlers/eventHandler';
import { bootLog } from './util';

dotenv.config();

const init = async () => {
  bootLog('Bot is starting...');

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMembers,
    ],
  }) as DiscordClient;

  eventHandler(client);

  client.login(process.env.BOT_TOKEN);
};

init();
