import { DiscordClient } from '../../typings/client';
import { errorLog, eventLog } from '../../util/dbg';
import { BotGuildConfig, SelectableRoleOption } from '../../schemas';

export default (client: DiscordClient): void => {
  client.on('guildDelete', (guild) => {
    eventLog(`Guild left: ${guild.name} (${guild.id})`);
    const query = {
      guild_id: guild?.id,
    };

    BotGuildConfig.findOneAndDelete(query)
      .then(() => {
        eventLog(`Removed guild config for "${guild.name}" (${guild.id})`);
      })
      .catch((e) => {
        eventLog(`Could not remove guild config for "${guild.name}" (${guild.id})`);
        errorLog('DB error: %O', e);
      });

    SelectableRoleOption.deleteMany({ guild_id: guild?.id })
      .then(() => {
        eventLog(`Removed guild selectable role options for "${guild.name}" (${guild.id})`);
      })
      .catch((e) => {
        eventLog(`Could not remove guild selectable role options for "${guild.name}" (${guild.id})`);
        errorLog('DB error: %O', e);
      });
  });
};
