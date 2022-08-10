import { DiscordClient } from '../../typings/client';
import { errorLog, getMembersCountChannelID } from '../../util';

export default (client: DiscordClient): void => {
  client.on('guildMemberRemove', async (member) => {
    const memberCountChannelId = await getMembersCountChannelID(member.guild.id);
    const c = member.guild.channels.cache.get(memberCountChannelId ?? '');

    c?.setName(`Member count: ${member.guild.members.cache.filter((m) => !m.user.bot).size}`).catch((e) => {
      errorLog('Could not set member count\n========================\n%O', e);
    });
  });
};
