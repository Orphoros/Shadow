import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { DiscordClient } from '../../typings/client';
import { errorLog, eventLog } from '../../util';
import { BotGuildConfig } from '../../schemas';

export default (client: DiscordClient): void => {
  client.on('guildCreate', async (guild) => {
    eventLog(`New guild joined: ${guild.name} (${guild.id})`);
    const owner = await guild.fetchOwner();
    const query = {
      guild_id: guild?.id,
    };
    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    };

    const channel = guild.channels.cache.find((c) => c.type !== ChannelType.GuildText
    && c.permissionsFor(guild!.members.me!).has(PermissionFlagsBits.SendMessages));

    const update = {
      main_channel_id: channel?.id,
      admin_users: [owner.id],
    };

    BotGuildConfig.findOneAndUpdate(query, update, options)
      .then(() => {
        eventLog(`Auto update main channel and admin user config for guild ${guild.name} (${guild.id})`);
      })
      .catch((e) => {
        eventLog(`Could not update main channel and admin user config for guild ${guild.name} (${guild.id})`);
        errorLog('DB error\n========================\n%O', e);
      });
  });
};
