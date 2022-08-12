import { ApplicationCommandDataResolvable, Collection } from 'discord.js';
import { bootCommandLog, errorLog, getFiles } from '../util';
import { DiscordClient } from '../typings/client';

export default async (client: DiscordClient) => {
  if (!client.user || !client.application) {
    return;
  }

  if (process.env.RESET_COMMANDS === 'true') {
    bootCommandLog('Clearing registered commands...');

    if (process.env.ENV === 'production') {
      await client.application.commands
        .set([])
        .then(() => bootCommandLog('Cleared globally registered commands!'))
        .catch((e) => errorLog('Could not clear globally registered commands: %O', e));
    }

    const devGuild = await client.guilds.fetch(process.env.DEV_GUILD_ID ?? '');
    if (devGuild && devGuild.commands && process.env.ENV === 'development') {
      await devGuild.commands.set([])
        .then(() => bootCommandLog('Cleared development registered commands!'))
        .catch((e) => errorLog('Could not clear registered commands for the guild\n========================\n%O', e));
    }
  }

  const commands:ApplicationCommandDataResolvable[] = [];

  const suffix = '.cmd.ts';
  const commandFiles = getFiles('./src/commands', suffix);

  client.commands = new Collection();
  for (const command of commandFiles) {
    try {
      const split = command.replace(/\\/g, '/').split('/');
      const commandName = split[split.length - 1].replace(suffix, '');
      bootCommandLog('Loading command %o', commandName);
      // eslint-disable-next-line max-len
      // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
      let commandFile = require(command);
      if (commandFile.default) commandFile = commandFile.default;

      client.commands.set(commandFile.data.name, commandFile);
      commands.push(commandFile.data.toJSON());
    } catch (e) {
      errorLog(`Error loading command file '${command}': %O`, e);
    }
  }

  if (process.env.RESET_COMMANDS === 'true') {
    if (process.env.ENV === 'production') {
      client.application.commands
        .set(commands)
        .then(() => bootCommandLog('Registered commands for production'))
        .catch((e) => errorLog('Could not register commands for production\n========================\n%O', e));
    } else if (process.env.DEV_GUILD_ID && process.env.ENV === 'development') {
      client.application.commands
        .set(commands, process.env.DEV_GUILD_ID)
        .then(() => bootCommandLog('Registered commands for development'))
        .catch((e) => errorLog('Could not register commands for development\n========================\n%O', e));
    } else {
      errorLog('Could not register commands: No environment set');
    }
  }
};
