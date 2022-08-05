import { ObjectId, Query } from 'mongoose';
import {
  CacheType, CommandInteraction, Guild, GuildMemberRoleManager,
} from 'discord.js';
import { BotGuildConfig, IBotGuildConfig } from '../schemas/guildConfig';

function getBotConfig(guildId: string)
: Query<(IBotGuildConfig & { _id: ObjectId; })
| null, IBotGuildConfig & { _id: ObjectId; }, Record<string, unknown>, IBotGuildConfig> {
  return BotGuildConfig.findOne({ guild_id: guildId });
}

export function getAutoVoiceChannelId(guildId: string): Promise<string | undefined> {
  return getBotConfig(guildId).then((config) => {
    if (config) return config.auto_vc_channel_id;
    return '';
  }).catch(() => '');
}

export function getWelcomeChannelId(guildId: string): Promise<string | undefined> {
  return getBotConfig(guildId).then((config) => {
    if (config) return config.welcome_channel_id;
    return '';
  }).catch(() => '');
}

export function getIntroductionChannelId(guildId: string): Promise<string | undefined> {
  return getBotConfig(guildId).then((config) => {
    if (config) return config.introduction_channel_id;
    return '';
  }).catch(() => '');
}

export function getRulesChannelId(guildId: string): Promise<string | undefined> {
  return getBotConfig(guildId).then((config) => {
    if (config) return config.rules_channel_id;
    return '';
  }).catch(() => '');
}

export function getWelcomeMessage(guildId: string): Promise<string | undefined> {
  return getBotConfig(guildId).then((config) => {
    if (config) return config.welcome_message;
    return '';
  }).catch(() => '');
}

export function getMembersCountChannelID(guildId: string): Promise<string | undefined> {
  return getBotConfig(guildId).then((config) => {
    if (config) return config.members_count_channel_id;
    return '';
  }).catch(() => '');
}

export function getMainChannelId(guildId: string): Promise<string | undefined> {
  return getBotConfig(guildId).then((config) => {
    if (config) return config.main_channel_id;
    return '';
  }).catch(() => '');
}

export function getAdminUsers(guildId: string): Promise<string[]> {
  return getBotConfig(guildId)
    .then((config) => config?.admin_users || [])
    .catch(() => []);
}

export function getAdminRoles(guildId: string): Promise<string[]> {
  return getBotConfig(guildId)
    .then((config) => config?.admin_roles || [])
    .catch(() => []);
}

export function isUserAuthorized(
  interaction: CommandInteraction<CacheType>,
  guild: Guild | null,
)
: Promise<boolean> {
  if (guild === null || !guild.id || !interaction.member) return Promise.resolve(false);
  const userID = interaction.member.user?.id ?? '';
  const userRoles = interaction.member.roles as GuildMemberRoleManager;

  const guildOwnerID = guild?.ownerId ?? '';

  const isInUserList = getAdminUsers(guild.id).then((users) => users.includes(userID));
  const isInAdminRolesList = getAdminRoles(guild.id)
    .then((roles) => userRoles.cache.some((role) => roles.includes(role.id)));

  return Promise.all([isInUserList, isInAdminRolesList])
    .then(([users, roles]) => users || roles || (userID === guildOwnerID)).catch(() => false);
}
