import {
  bootEventLog, bootLog, errorLog, getFiles,
} from '../util';
import { DiscordClient } from '../typings/client';

export default (client: DiscordClient) => {
  bootLog('Loading events...');

  const suffix = '.e.ts';
  const eventFiles = getFiles('./src/events', suffix);

  const readyEventFile = eventFiles.find((event) => event.match(/^.+\/ready.e.ts$/i));
  if (!readyEventFile) errorLog('Mandatory "ready" event was not found found!');
  else {
    const index = eventFiles.indexOf(readyEventFile);
    eventFiles.unshift(eventFiles.splice(index, 1)[0]);

    for (const eventFile of eventFiles) {
      try {
        const split = eventFile.replace(/\\/g, '/').split('/');
        const eventName = split[split.length - 1].replace(suffix, '');
        bootEventLog('Registering event listener %o', eventName);

        // eslint-disable-next-line max-len
        // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
        let event = require(eventFile);
        if (event.default) event = event.default;

        event(client);
      } catch (e) {
        errorLog(`Error registering event file '${eventFile}': %O`, e);
      }
    }
  }
};
