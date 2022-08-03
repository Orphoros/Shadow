import { DiscordClient } from '../../typings/client';
import shutdown from '../../util/shutdown';

export default (client: DiscordClient): void => {
  process.on('SIGTERM', () => {
    shutdown(client);
  });
  process.on('SIGINT', () => {
    shutdown(client);
  });
};
