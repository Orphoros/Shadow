import { errorLog } from '../util/dbg';
import { DiscordClient } from '../typings/client';
import { getAutoVoiceChannelName } from '../util/mongoIO';

export default (client: DiscordClient): void => {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    const { member, guild } = oldState;
    const newChannel = newState.channel;
    const oldChannel = oldState.channel;
    const user = await client.users.fetch(newState.id);
    const vcName = await getAutoVoiceChannelName(guild.id);

    if (!oldChannel && newChannel!.name === vcName) {
      await guild.channels
        .create(`🗣️ ${user.username}`, {
          type: 'GUILD_VOICE',
          parent: newChannel?.parent?.id,
        })
        .then((c) => member!.voice.setChannel(c))
        .catch((e) => errorLog('Could not automatically create voice channel: %O', e));
    } else if (!newState.channel) {
      if (oldChannel?.members.size === 0) {
          oldState!.channel!.delete().catch((e) => errorLog('Could not clear up VC automatically: %O', e));
      }
    }
  });
};
