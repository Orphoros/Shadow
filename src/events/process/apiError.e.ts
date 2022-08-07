import { errorLog } from '../../util/dbg';

export default (): void => {
  process.on('unhandledRejection', (e) => {
    // Todo: Inform guilds if the bot crashes!
    errorLog('Unhandled rejection: %O', e);
  });
};
