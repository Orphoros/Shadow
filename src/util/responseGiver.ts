import {
  CacheType, ChatInputCommandInteraction, ButtonInteraction,
  EmbedBuilder, StringSelectMenuInteraction,
} from 'discord.js';
import { errorLog } from '.';

export enum EmbedMessageType {
  Error,
  Info,
  Warning,
  Success
}
function returnEmbed(msg: string, type: EmbedMessageType): EmbedBuilder {
  switch (type) {
    case EmbedMessageType.Error:
      return new EmbedBuilder()
        .setColor('#be3838')
        .setAuthor({ name: 'Denied', iconURL: 'https://cdn3.emoji.gg/emojis/7013-do-not-disturb.png' })
        .setDescription(msg);
    case EmbedMessageType.Info:
      return new EmbedBuilder()
        .setColor('#4463e9')
        .setAuthor({ name: 'Info', iconURL: 'https://cdn3.emoji.gg/emojis/2899-info.png' })
        .setDescription(msg);
    case EmbedMessageType.Warning:
      return new EmbedBuilder()
        .setColor('#ffca25')
        .setAuthor({ name: 'Warning', iconURL: 'https://cdn3.emoji.gg/emojis/3092-idle-status.png' })
        .setDescription(msg);
    case EmbedMessageType.Success:
      return new EmbedBuilder()
        .setColor('#269601')
        .setAuthor({ name: 'Success', iconURL: 'https://cdn3.emoji.gg/emojis/2365-win11-check-icon.png' })
        .setDescription(msg);
    default:
      return new EmbedBuilder()
        .setColor('#008080')
        .setDescription(msg);
  }
}

export function returnCrashMsg(
  msg: string,
  err?: any,
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#ff0000')
    .setAuthor({ name: 'BOT ERROR', iconURL: 'https://cdn3.emoji.gg/emojis/3595-failed.png' })
    .setDescription(`**An error has happened in the code of the bot!**\n This may mean that the bot cannot function properly from this point on!\n\n__What happened:__\n>>> *${msg}*`)
    .addFields(
      { name: 'What to do', value: 'Please inform <@400271116607946752>, the developer of this bot about this error by sending this message!', inline: false },
      { name: 'Developer debug info', value: `\`\`\`\n${err ?? 'None provided'}\`\`\``, inline: true },
    )
    .setTimestamp();
}

export function sendResponse(
  intr: ChatInputCommandInteraction<CacheType>
  | StringSelectMenuInteraction<CacheType>
  | ButtonInteraction<CacheType>,
  message: string,
  type: EmbedMessageType,
  errLog: string,
): void {
  intr.reply({
    embeds: [returnEmbed(message, type)],
    ephemeral: true,
  }).catch((e: string) => {
    errorLog(`${errLog}\n========================\n%O`, e);
  });
}

export function sendCrashResponse(
  intr: ChatInputCommandInteraction<CacheType>
  | StringSelectMenuInteraction<CacheType>
  | ButtonInteraction<CacheType>,
  message: string,
  err: any,
): void {
  errorLog(`${message}\n========================\n%O`, err);
  intr.reply({
    embeds: [returnCrashMsg(message, err)],
    ephemeral: true,
  }).catch((e2: string) => {
    errorLog('Could not send crash interaction message to user\n========================\n%O', e2);
  });
}
