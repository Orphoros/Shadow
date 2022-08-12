import { errorLog } from '../../util/dbg';

export default (): void => {
  process.on('shardError', (e) => {
    // TODO: Inform guilds if the bot crashes!
    errorLog('Shard error\n========================\n%O', e);
  });
};
