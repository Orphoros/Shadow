import mongoose from 'mongoose';
import { DiscordClient } from '../typings/client';
import { appLog } from '../util';

export default function shutdown(client: DiscordClient, exitCode?: number): void {
  appLog('Shutting down...');
  client.destroy();
  mongoose.connection.close().then(() => {
    appLog('Disconnected from MongoDB!');
  }).catch((e) => {
    appLog('Could not disconnect from MongoDB\n========================\n%O', e);
  });
  process.exit(exitCode ?? 0);
}
