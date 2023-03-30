import { ChannelType, VoiceBasedChannel } from 'discord.js';
import { DiscordClient } from '../typings/client';
import { getAutoVoiceChannelId } from '../util';

export default (client: DiscordClient): void => {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    const { member, guild } = oldState;
    const newChannel = newState.channel;
    const vc = await getAutoVoiceChannelId(guild.id);

    if (newChannel && newChannel!.id === vc) {
      const channel = guild.channels.cache
        .find((c) => c.id === vc
        && c.type === ChannelType.GuildVoice) as VoiceBasedChannel | undefined;
      client.vcManager.createVC(guild, channel!, member!); // TODO: Handle errors
    } else if (!newState.channel) {
      client.vcManager.cleanUp(guild);
    }
  });
};
