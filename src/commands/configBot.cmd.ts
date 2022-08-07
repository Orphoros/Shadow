import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction, MessageEmbed,
} from 'discord.js';
import { EmbedMessageType, returnCrashMsg, returnEmbed } from '../util/responseGiver';
import { errorLog } from '../util/dbg';
import { DiscordClient } from '../typings/client';
import { BotGuildConfig } from '../schemas/guildConfig';
import { isUserAuthorized } from '../util/mongoIO';

export default {
  data: new SlashCommandBuilder()
    .setName('bot-conf')
    .setDescription('Configure the settings of the bot for this server')

    .addSubcommandGroup((group) => group
      .setName('set')
      .setDescription('Sets a configuration of the bot')
      .addSubcommand((subcommand) => subcommand
        .setName('welcome-channel')
        .setDescription('Set the welcome channel where the bot will greet new members')
        .addChannelOption((option) => option
          .setName('welcome-channel')
          .setDescription('The channel where new members should be announced')
          .setRequired(true)))
      .addSubcommand((subcommand) => subcommand
        .setName('announcements-channel')
        .setDescription('Set the announcement channel where the bot will announce news and updates')
        .addChannelOption((option) => option
          .setName('announcements-channel')
          .setDescription('The announcement channel where the bot will announce news and updates')
          .setRequired(true)))
      .addSubcommand((subcommand) => subcommand
        .setName('rules-channel')
        .setDescription('Set the channel where the rules of the server are posted')
        .addChannelOption((option) => option
          .setName('rules-channel')
          .setDescription('The channel where the rules of the server are posted')
          .setRequired(true)))
      .addSubcommand((subcommand) => subcommand
        .setName('introduction-channel')
        .setDescription('Set the channel where people can introduce themselves to the server')
        .addChannelOption((option) => option
          .setName('introduction-channel')
          .setDescription('The introduction channel where people can introduce themselves to the server')
          .setRequired(true)))
      .addSubcommand((subcommand) => subcommand
        .setName('main-channel')
        .setDescription('Set the main, general text channel where the bot can post messages')
        .addChannelOption((option) => option
          .setName('general-channel')
          .setDescription('The channel where logs and other generic messages will be sent')
          .setRequired(true)))
      .addSubcommand((subcommand) => subcommand
        .setName('welcome-message')
        .setDescription('Set the message that will be sent to new members')
        .addStringOption((option) => option
          .setName('welcome-message')
          .setDescription('The message that will be sent to new members when they join')
          .setRequired(true)))
      .addSubcommand((subcommand) => subcommand
        .setName('auto-vc')
        .setDescription('Set the voice channel from which the bot will create new voice channels on join')
        .addChannelOption((option) => option
          .setName('vc')
          .setDescription('The voice channel to monitor')
          .setRequired(true)))
      .addSubcommand((subcommand) => subcommand
        .setName('members-counter-channel')
        .setDescription('Set the voice channel where members count will be displayed')
        .addChannelOption((option) => option
          .setName('vc')
          .setDescription('The voice channel where members count will be displayed')
          .setRequired(true))))

    .addSubcommandGroup((group) => group
      .setName('add')
      .setDescription('Adds a configuration to the bot')
      .addSubcommand((subcommand) => subcommand
        .setName('admin-user')
        .setDescription('Add a user to the list of users who can control the bot')
        .addUserOption((option) => option
          .setName('user')
          .setDescription('A Discord user to allow control over the bot')
          .setRequired(true)))
      .addSubcommand((subcommand) => subcommand
        .setName('admin-role')
        .setDescription('Add a role to the list of roles who can control the bot')
        .addRoleOption((option) => option
          .setName('role')
          .setDescription('A role under which users can control the bot')
          .setRequired(true))))

    .addSubcommandGroup((group) => group
      .setName('remove')
      .setDescription('Removes a configuration from the bot')
      .addSubcommand((subcommand) => subcommand
        .setName('admin-user')
        .setDescription('Remove a user from the list of users who can control the bot')
        .addUserOption((option) => option
          .setName('user')
          .setDescription('An existing Discord user to remove from the bot admin user list')
          .setRequired(true)))
      .addSubcommand((subcommand) => subcommand
        .setName('admin-role')
        .setDescription('Remove a role from the list of roles who can control the bot')
        .addRoleOption((option) => option
          .setName('role')
          .setDescription('An existing role to remove under which users can control the bot')
          .setRequired(true))))

    .addSubcommandGroup((group) => group
      .setName('show')
      .setDescription('Shows current configuration details')
      .addSubcommand((subcommand) => subcommand
        .setName('config')
        .setDescription('Show a list of all the current configurations'))),

  async execute(interaction: CommandInteraction<CacheType>, client: DiscordClient): Promise<void> {
    if (await isUserAuthorized(interaction, interaction.guild)) {
      const command = `${interaction.options.getSubcommandGroup() ?? 'def'}.${interaction.options.getSubcommand()}`;
      const query = {
        guild_id: interaction.guild?.id,
      };
      const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      };

      switch (command) {
        case 'set.welcome-channel': {
          const channelID = interaction.options.getChannel('welcome-channel')?.id;

          const cnl = interaction.guild?.channels.cache
            .find((c) => c.id === channelID && c.type === 'GUILD_TEXT' && c.permissionsFor(interaction.guild!.me!).has('SEND_MESSAGES'));
          if (!cnl) {
            interaction.reply({
              embeds: [returnEmbed('Could not set this channel for the welcome message channel! Channel needs to be a text channel and the bot must be able to write to it!', EmbedMessageType.Error)],
              ephemeral: true,
            }).catch((e2) => {
              errorLog('Could not send interaction message to user: %O', e2);
            });
            return;
          }

          const update = {
            welcome_channel_id: channelID,
          };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              interaction.reply({
                embeds: [returnEmbed(`Welcome channel is now configured to <#${channelID}>`, EmbedMessageType.Success)],
                ephemeral: true,
              }).catch((e) => {
                errorLog('Could not send interaction message to user: %O', e);
              });
            })
            .catch((e) => {
              errorLog('Could not save the new bot config: %O', e);
              interaction.reply({
                embeds: [returnCrashMsg('Could not set the new bot config with the database!', e)],
                ephemeral: true,
              }).catch((e2) => {
                errorLog('Could not send interaction message to user: %O', e2);
              });
            });
          break;
        }

        case 'set.introduction-channel': {
          const channelID = interaction.options.getChannel('introduction-channel')?.id;

          const cnl = interaction.guild?.channels.cache
            .find((c) => c.id === channelID && c.type === 'GUILD_TEXT' && c.permissionsFor(interaction.guild!.me!).has('SEND_MESSAGES'));
          if (!cnl) {
            interaction.reply({
              embeds: [returnEmbed('Could not set this channel for the introduction channel! Channel needs to be a text channel and the bot must be able to write to it!', EmbedMessageType.Error)],
              ephemeral: true,
            }).catch((e2) => {
              errorLog('Could not send interaction message to user: %O', e2);
            });
            return;
          }

          const update = {
            introduction_channel_id: channelID,
          };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              interaction.reply({
                embeds: [returnEmbed(`Introduction channel is now configured to <#${channelID}>`, EmbedMessageType.Success)],
                ephemeral: true,
              }).catch((e) => {
                errorLog('Could not send interaction message to user: %O', e);
              });
            })
            .catch((e) => {
              errorLog('Could not save the new bot config: %O', e);
              interaction.reply({
                embeds: [returnCrashMsg('Could not set the new bot config with the database!', e)],
                ephemeral: true,
              }).catch((e2) => {
                errorLog('Could not send interaction message to user: %O', e2);
              });
            });
          break;
        }

        case 'set.rules-channel': {
          const channelID = interaction.options.getChannel('rules-channel')?.id;

          const cnl = interaction.guild?.channels.cache
            .find((c) => c.id === channelID && c.type === 'GUILD_TEXT' && c.permissionsFor(interaction.guild!.me!).has('SEND_MESSAGES'));
          if (!cnl) {
            interaction.reply({
              embeds: [returnEmbed('Could not set this channel for the rules channel! Channel needs to be a text channel and the bot must be able to write to it!', EmbedMessageType.Error)],
              ephemeral: true,
            }).catch((e2) => {
              errorLog('Could not send interaction message to user: %O', e2);
            });
            return;
          }

          const update = {
            rules_channel_id: channelID,
          };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              interaction.reply({
                embeds: [returnEmbed(`Rules channel is now configured to <#${channelID}>`, EmbedMessageType.Success)],
                ephemeral: true,
              }).catch((e) => {
                errorLog('Could not send interaction message to user: %O', e);
              });
            })
            .catch((e) => {
              errorLog('Could not save the new bot config: %O', e);
              interaction.reply({
                embeds: [returnCrashMsg('Could not set the new bot config with the database!', e)],
                ephemeral: true,
              }).catch((e2) => {
                errorLog('Could not send interaction message to user: %O', e2);
              });
            });
          break;
        }

        case 'set.announcements-channel': {
          const channelID = interaction.options.getChannel('announcements-channel')?.id;

          const cnl = interaction.guild?.channels.cache
            .find((c) => c.id === channelID && (c.type === 'GUILD_TEXT' || c.type === 'GUILD_NEWS') && c.permissionsFor(interaction.guild!.me!).has('SEND_MESSAGES'));
          if (!cnl) {
            interaction.reply({
              embeds: [returnEmbed('Could not set this channel for the announcements channel! Channel needs to be a text channel and the bot must be able to write to it!', EmbedMessageType.Error)],
              ephemeral: true,
            }).catch((e2) => {
              errorLog('Could not send interaction message to user: %O', e2);
            });
            return;
          }

          const update = {
            announcement_channel_id: channelID,
          };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              interaction.reply({
                embeds: [returnEmbed(`Announcement channel is now configured to <#${channelID}>`, EmbedMessageType.Success)],
                ephemeral: true,
              }).catch((e) => {
                errorLog('Could not send interaction message to user: %O', e);
              });
            })
            .catch((e) => {
              errorLog('Could not save the new bot config: %O', e);
              interaction.reply({
                embeds: [returnCrashMsg('Could not set the new bot config with the database!', e)],
                ephemeral: true,
              }).catch((e2) => {
                errorLog('Could not send interaction message to user: %O', e2);
              });
            });
          break;
        }

        case 'set.members-counter-channel': {
          const channelID = interaction.options.getChannel('vc')?.id;

          const cnl = interaction.guild?.channels.cache
            .find((c) => c.id === channelID && c.type === 'GUILD_VOICE');
          if (!cnl) {
            interaction.reply({
              embeds: [returnEmbed('Could not set this channel for the displaying member count! Channel needs to be a voice channel and the bot must be able to rename it!', EmbedMessageType.Error)],
              ephemeral: true,
            }).catch((e2) => {
              errorLog('Could not send interaction message to user: %O', e2);
            });
            return;
          }

          const update = {
            members_count_channel_id: channelID,
          };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              cnl?.setName(`Member count: ${interaction.guild?.members.cache.filter((m) => !m.user.bot).size}`).catch((e) => {
                errorLog('Could not set member count: %O', e);
              });

              interaction.reply({
                embeds: [returnEmbed(`Members count is now set to be displayed on channel <#${channelID}>! \n\n Make sure the bot has the permission to rename this channel!`, EmbedMessageType.Success)],
                ephemeral: true,
              }).catch((e) => {
                errorLog('Could not send interaction message to user: %O', e);
              });
            })
            .catch((e) => {
              errorLog('Could not save the new bot config: %O', e);
              interaction.reply({
                embeds: [returnCrashMsg('Could not set the new bot config with the database!', e)],
                ephemeral: true,
              }).catch((e2) => {
                errorLog('Could not send interaction message to user: %O', e2);
              });
            });
          break;
        }

        case 'set.main-channel': {
          const channelID = interaction.options.getChannel('general-channel')?.id;

          const cnl = interaction.guild?.channels.cache
            .find((c) => c.id === channelID && c.type === 'GUILD_TEXT' && c.permissionsFor(interaction.guild!.me!).has('SEND_MESSAGES'));
          if (!cnl) {
            interaction.reply({
              embeds: [returnEmbed('Could not set this channel for the main message channel! Channel needs to be a text channel and the bot must be able to write to it!', EmbedMessageType.Error)],
              ephemeral: true,
            }).catch((e2) => {
              errorLog('Could not send interaction message to user: %O', e2);
            });
            return;
          }

          const update = {
            main_channel_id: channelID,
          };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              interaction.reply({
                embeds: [returnEmbed(`Main channel is now configured to <#${channelID}>`, EmbedMessageType.Success)],
                ephemeral: true,
              }).catch((e) => {
                errorLog('Could not send interaction message to user: %O', e);
              });
            })
            .catch((e) => {
              errorLog('Could not save the new bot config: %O', e);
              interaction.reply({
                embeds: [returnCrashMsg('Could not set the new bot config with the database!', e)],
                ephemeral: true,
              }).catch((e2) => {
                errorLog('Could not send interaction message to user: %O', e2);
              });
            });
          break;
        }

        case 'set.auto-vc': {
          const channelID = interaction.options.getChannel('vc')?.id;

          const cnl = interaction.guild?.channels.cache
            .find((c) => c.id === channelID && c.type === 'GUILD_VOICE');
          if (!cnl) {
            interaction.reply({
              embeds: [returnEmbed('Could not set this channel for auto voice channel monitoring! The channel needs to be a voice channel and the bot must be able to create new voice channels there!', EmbedMessageType.Error)],
              ephemeral: true,
            }).catch((e2) => {
              errorLog('Could not send interaction message to user: %O', e2);
            });
            return;
          }

          const update = {
            auto_vc_channel_id: channelID,
          };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              interaction.reply({
                embeds: [returnEmbed(`Voice channel monitoring is now configured to <#${channelID}>`, EmbedMessageType.Success)],
                ephemeral: true,
              }).catch((e) => {
                errorLog('Could not send interaction message to user: %O', e);
              });
            })
            .catch((e) => {
              errorLog('Could not save the new bot config: %O', e);
              interaction.reply({
                embeds: [returnCrashMsg('Could not set the new bot config with the database!', e)],
                ephemeral: true,
              }).catch((e2) => {
                errorLog('Could not send interaction message to user: %O', e2);
              });
            });
          break;
        }

        case 'set.welcome-message': {
          const msg = interaction.options.getString('welcome-message');

          const update = {
            welcome_message: msg,
          };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              interaction.reply({
                embeds: [returnEmbed('The new member welcome message has been set!', EmbedMessageType.Success)],
                ephemeral: true,
              }).catch((e) => {
                errorLog('Could not send interaction message to user: %O', e);
              });
            })
            .catch((e) => {
              errorLog('Could not save the new bot config: %O', e);
              interaction.reply({
                embeds: [returnCrashMsg('Could not set the new bot config with the database!', e)],
                ephemeral: true,
              }).catch((e2) => {
                errorLog('Could not send interaction message to user: %O', e2);
              });
            });
          break;
        }

        case 'add.admin-user': {
          const userID = interaction.options.getUser('user')?.id;

          const array = await BotGuildConfig
            .find({ guild_id: interaction.guild?.id, admin_users: userID }, { 'admin_users.$': 1 });

          if (array.length > 0) {
            interaction.reply({
              embeds: [returnEmbed(`User <@${userID}> is already an admin`, EmbedMessageType.Error)],
              ephemeral: true,
            }).catch((e) => {
              errorLog('Could not send interaction message to user: %O', e);
            });
            break;
          }

          const update = {
            $push: { admin_users: userID },
          };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              interaction.reply({
                embeds: [returnEmbed(`User <@${userID}> has now full access to this bot!`, EmbedMessageType.Success)],
                ephemeral: true,
              }).catch((e) => {
                errorLog('Could not send interaction message to user: %O', e);
              });
            })
            .catch((e) => {
              errorLog('Could not save the new bot config: %O', e);
              interaction.reply({
                embeds: [returnCrashMsg('Could not set the new bot config with the database!', e)],
                ephemeral: true,
              }).catch((e2) => {
                errorLog('Could not send interaction message to user: %O', e2);
              });
            });

          break;
        }

        case 'add.admin-role': {
          const roleID = interaction.options.getRole('role')?.id;
          const update = {
            $push: { admin_roles: roleID },
          };

          const array = await BotGuildConfig
            .find({ guild_id: interaction.guild?.id, admin_roles: roleID }, { 'admin_roles.$': 1 });

          if (array.length > 0) {
            interaction.reply({
              embeds: [returnEmbed(`Users under role <@&${roleID}> are already an admin`, EmbedMessageType.Error)],
              ephemeral: true,
            }).catch((e) => {
              errorLog('Could not send interaction message to user: %O', e);
            });
            break;
          }

          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              interaction.reply({
                embeds: [returnEmbed(`Users under role <@&${roleID}> have now full access to this bot!`, EmbedMessageType.Success)],
                ephemeral: true,
              }).catch((e) => {
                errorLog('Could not send interaction message to user: %O', e);
              });
            })
            .catch((e) => {
              errorLog('Could not save the new bot config: %O', e);
              interaction.reply({
                embeds: [returnCrashMsg('Could not set the new bot config with the database!', e)],
                ephemeral: true,
              }).catch((e2) => {
                errorLog('Could not send interaction message to user: %O', e2);
              });
            });
          break;
        }

        case 'remove.admin-user': {
          const userID = interaction.options.getUser('user')?.id;

          const array = await BotGuildConfig
            .find({ guild_id: interaction.guild?.id, admin_users: userID }, { 'admin_users.$': 1 });

          if (array.length === 0) {
            interaction.reply({
              embeds: [returnEmbed(`User <@${userID}> does not exist in the config!`, EmbedMessageType.Error)],
              ephemeral: true,
            }).catch((e) => {
              errorLog('Could not send interaction message to user: %O', e);
            });
            break;
          }

          const update = {
            $pull: { admin_users: userID },
          };
          BotGuildConfig.updateOne(query, update, options)
            .then(() => {
              interaction.reply({
                embeds: [returnEmbed(`User <@${userID}> has removed from the admin bot config!`, EmbedMessageType.Success)],
                ephemeral: true,
              }).catch((e) => {
                errorLog('Could not send interaction message to user: %O', e);
              });
            })
            .catch((e) => {
              errorLog('Could not save the new bot config: %O', e);
              interaction.reply({
                embeds: [returnCrashMsg('Could not set the new bot config with the database!', e)],
                ephemeral: true,
              }).catch((e2) => {
                errorLog('Could not send interaction message to user: %O', e2);
              });
            });

          break;
        }

        case 'remove.admin-role': {
          const roleID = interaction.options.getRole('role')?.id;
          const update = {
            $pull: { admin_roles: roleID },
          };

          const array = await BotGuildConfig
            .find({ guild_id: interaction.guild?.id, admin_roles: roleID }, { 'admin_roles.$': 1 });

          if (array.length === 0) {
            interaction.reply({
              embeds: [returnEmbed(`Role <@&${roleID}> is not configured! Cannot remove it!`, EmbedMessageType.Error)],
              ephemeral: true,
            }).catch((e) => {
              errorLog('Could not send interaction message to user: %O', e);
            });
            break;
          }

          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              interaction.reply({
                embeds: [returnEmbed(`Users under role <@&${roleID}> are now removed from the admin bot config list`, EmbedMessageType.Success)],
                ephemeral: true,
              }).catch((e) => {
                errorLog('Could not send interaction message to user: %O', e);
              });
            })
            .catch((e) => {
              errorLog('Could not save the new bot config: %O', e);
              interaction.reply({
                embeds: [returnCrashMsg('Could not set the new bot config with the database!', e)],
                ephemeral: true,
              }).catch((e2) => {
                errorLog('Could not send interaction message to user: %O', e2);
              });
            });
          break;
        }

        case 'show.config': {
          const config = await BotGuildConfig.findOne(query);

          if (!config) {
            interaction.reply({
              embeds: [returnEmbed('Could not find configuration for this server!', EmbedMessageType.Error)],
              ephemeral: true,
            }).catch((e) => {
              errorLog('Could not send interaction message to user: %O', e);
            });
            break;
          }

          const embed = new MessageEmbed()
            .setAuthor({ name: `${client.user?.username}`, iconURL: `${client.user?.displayAvatarURL()}` })
            .setTitle('Bot Configuration')
            .setColor(0x7289da)
            .setDescription(`
            __Admin Users:__
            > ${(!config.admin_users || config.admin_users.length === 0) ? '*None*' : config.admin_users.map((user) => `<@${user}>`).join(' ')}

            __Admin Roles:__
            > ${(!config.admin_roles || config.admin_roles.length === 0) ? '*None*' : config.admin_roles.map((role) => `<@&${role}>`).join(' ')}

            __Welcome channel:__
            > ${(!config.welcome_channel_id) ? '*None*' : `<#${config.welcome_channel_id}>`}

            __Announcements channel:__
            > ${(!config.announcement_channel_id) ? '*None*' : `<#${config.announcement_channel_id}>`}

            __Rules channel:__
            > ${(!config.rules_channel_id) ? '*None*' : `<#${config.rules_channel_id}>`}

            __Introduction channel:__
            > ${(!config.introduction_channel_id) ? '*None*' : `<#${config.introduction_channel_id}>`}

            __Main channel:__
            > ${(!config.main_channel_id) ? '*None*' : `<#${config.main_channel_id}>`}

            __Auto VC:__
            > ${(!config.auto_vc_channel_id) ? '*None*' : `<#${config.auto_vc_channel_id}>`}

            __Members counting channel:__
            > ${(!config.members_count_channel_id) ? '*None*' : `<#${config.members_count_channel_id}>`}

            __Welcome message:__
            >>> ${(!config.welcome_message) ? '*None*' : config.welcome_message.replaceAll('\\n', '\n')}
            `);

          interaction.reply({
            embeds: [embed],
            ephemeral: true,
          }).catch((e) => {
            errorLog('Could not send interaction message to user: %O', e);
          });

          break;
        }

        default: {
          errorLog('Bot config command handler found an unknown command request: %o', interaction.command);
          interaction.reply({
            embeds: [returnCrashMsg('An unrecognized command has been found!', `configBot.cmd.ts has received an unknown command: ${interaction.command}`)],
            ephemeral: true,
          }).catch((e2) => {
            errorLog('Could not send interaction message to user: %O', e2);
          });
          break;
        }
      }
    } else {
      interaction.reply({
        embeds: [returnEmbed('You do not have permission to configure this bot!', EmbedMessageType.Error)],
        ephemeral: true,
      }).catch((e) => {
        errorLog('Could not send interaction message to user: %O', e);
      });
    }
  },
};
