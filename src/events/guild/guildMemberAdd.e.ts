import { EmbedBuilder, TextChannel } from 'discord.js';
import {
  getIntroductionChannelId, getMainChannelId,
  getMembersCountChannelID, errorLog,
  getRulesChannelId, getWelcomeChannelId, getWelcomeMessage,
} from '../../util';
import { DiscordClient } from '../../typings/client';

// IMPORTANT: Needs "Presence intent" and "Server members intent" permission
export default (client: DiscordClient): void => {
  client.on('guildMemberAdd', async (member) => {
    const rulesChannelId = await getRulesChannelId(member.guild.id);
    const introductionChannelId = await getIntroductionChannelId(member.guild.id);
    const welcomeMessage = await getWelcomeMessage(member.guild.id);
    const mainChannelId = await getMainChannelId(member.guild.id);
    const memberCountChannelId = await getMembersCountChannelID(member.guild.id);

    const welcomeEmbed = new EmbedBuilder()

      .setColor('#b80000')
      .setTitle('Hello!')
      .setAuthor({ name: `${member.user.username}`, iconURL: `${member.user.displayAvatarURL()}` })
      .setDescription(
        `${welcomeMessage?.replaceAll('\\n', '\n')}
        
        <@${member.user.id}> joined <t:${Math.floor(Date.now() / 1000)}:R>`,
      )
      .setThumbnail('https://i.imgur.com/YRTheLR.gif')
      .addFields(
        { name: '\u200B', value: '\u200B' },
        { name: 'Rules channel', value: `<#${rulesChannelId ?? mainChannelId}>`, inline: true },
        { name: 'Introduction channel', value: `<#${introductionChannelId ?? mainChannelId}>`, inline: true },
      )
      .setImage('https://i.imgur.com/n2PgUtL.gif')
      .setTimestamp()
      .setFooter({ text: `${member.client.user?.username}`, iconURL: `${member.client.user?.displayAvatarURL()}` });

    const channel = client.channels.cache
      .get(await getWelcomeChannelId(member.guild.id) ?? '') as TextChannel;
    channel.send({ embeds: [welcomeEmbed] }).catch((e) => {
      errorLog('Could not send message to user\n========================\n%O', e);
    });

    const c = member.guild.channels.cache.get(memberCountChannelId ?? '');

    c?.setName(`Member count: ${member.guild.members.cache.filter((m) => !m.user.bot).size}`).catch((e) => {
      errorLog('Could not set member count\n========================\n%O', e);
    });
  });
};
