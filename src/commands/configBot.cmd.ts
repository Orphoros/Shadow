import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType, CommandInteraction, MessageEmbed,
} from 'discord.js';
import { DiscordClient } from '../typings/client';
import { BotGuildConfig } from '../schemas';
import {
  isUserAuthorized, errorLog, EmbedMessageType, sendResponse, sendCrashResponse,
} from '../util';

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
        .setName('base-role')
        .setDescription('Add a role that the bot can assign to those new members, who read the rules')
        .addRoleOption((option) => option
          .setName('role')
          .setDescription('A role that grants access to the server')
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
        .setName('base-role')
        .setDescription('Remove a role that the bot could use to assign to those new members, who read the rules')
        .addRoleOption((option) => option
          .setName('role')
          .setDescription('A role that grants access to the server')
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
            sendResponse(interaction, 'Could not set this channel for the welcome message channel! Channel needs to be a text channel and the bot must be able to write to it!', EmbedMessageType.Error, 'Could not send interaction message to user');
            return;
          }
          const update = { welcome_channel_id: channelID };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              sendResponse(interaction, `Welcome channel is now configured to <#${channelID}>`, EmbedMessageType.Info, 'Could not send interaction message to user');
            })
            .catch((e) => {
              sendCrashResponse(interaction, 'Could not set the new bot config with the database!', e);
            });
          break;
        }

        case 'set.introduction-channel': {
          const channelID = interaction.options.getChannel('introduction-channel')?.id;
          const cnl = interaction.guild?.channels.cache
            .find((c) => c.id === channelID && c.type === 'GUILD_TEXT' && c.permissionsFor(interaction.guild!.me!).has('SEND_MESSAGES'));
          if (!cnl) {
            sendResponse(interaction, 'Could not set this channel for the introduction channel! Channel needs to be a text channel and the bot must be able to write to it!', EmbedMessageType.Error, 'Could not send interaction message to user');
            return;
          }
          const update = { introduction_channel_id: channelID };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              sendResponse(interaction, `Introduction channel is now configured to <#${channelID}>`, EmbedMessageType.Info, 'Could not send interaction message to user');
            })
            .catch((e) => {
              sendCrashResponse(interaction, 'Could not set the new bot config with the database!', e);
            });
          break;
        }

        case 'set.rules-channel': {
          const channelID = interaction.options.getChannel('rules-channel')?.id;
          const cnl = interaction.guild?.channels.cache
            .find((c) => c.id === channelID && c.type === 'GUILD_TEXT' && c.permissionsFor(interaction.guild!.me!).has('SEND_MESSAGES'));
          if (!cnl) {
            sendResponse(interaction, 'Could not set this channel for the rules channel! Channel needs to be a text channel and the bot must be able to write to it!', EmbedMessageType.Error, 'Could not send interaction message to user');
            return;
          }
          const update = { rules_channel_id: channelID };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              sendResponse(interaction, `Rules channel is now configured to <#${channelID}>`, EmbedMessageType.Info, 'Could not send interaction message to user');
            })
            .catch((e) => {
              sendCrashResponse(interaction, 'Could not set the new bot config with the database!', e);
            });
          break;
        }

        case 'set.announcements-channel': {
          const channelID = interaction.options.getChannel('announcements-channel')?.id;
          const cnl = interaction.guild?.channels.cache
            .find((c) => c.id === channelID && (c.type === 'GUILD_TEXT' || c.type === 'GUILD_NEWS') && c.permissionsFor(interaction.guild!.me!).has('SEND_MESSAGES'));
          if (!cnl) {
            sendResponse(interaction, 'Could not set this channel for the announcements channel! Channel needs to be a text channel and the bot must be able to write to it!', EmbedMessageType.Error, 'Could not send interaction message to user');
            return;
          }
          const update = { announcement_channel_id: channelID };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              sendResponse(interaction, `Announcements channel is now configured to <#${channelID}>`, EmbedMessageType.Info, 'Could not send interaction message to user');
            })
            .catch((e) => {
              sendCrashResponse(interaction, 'Could not set the new bot config with the database!', e);
            });
          break;
        }

        case 'set.members-counter-channel': {
          const channelID = interaction.options.getChannel('vc')?.id;
          const cnl = interaction.guild?.channels.cache
            .find((c) => c.id === channelID && c.type === 'GUILD_VOICE');
          if (!cnl) {
            sendResponse(interaction, 'Could not set this channel for the members counter channel! Channel needs to be a voice channel and the bot must be able see it and edit its name!', EmbedMessageType.Error, 'Could not send interaction message to user');
            return;
          }
          const update = { members_count_channel_id: channelID };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              cnl?.setName(`Member count: ${interaction.guild?.members.cache.filter((m) => !m.user.bot).size}`).catch((e) => {
                errorLog('Could not set member count\n========================\n%O', e);
              });
              sendResponse(interaction, `Members counter channel is now configured to <#${channelID}>`, EmbedMessageType.Info, 'Could not send interaction message to user');
            })
            .catch((e) => {
              sendCrashResponse(interaction, 'Could not set the new bot config with the database!', e);
            });
          break;
        }

        case 'set.main-channel': {
          const channelID = interaction.options.getChannel('general-channel')?.id;
          const cnl = interaction.guild?.channels.cache
            .find((c) => c.id === channelID && c.type === 'GUILD_TEXT' && c.permissionsFor(interaction.guild!.me!).has('SEND_MESSAGES'));
          if (!cnl) {
            sendResponse(interaction, 'Could not set this channel for the main channel! Channel needs to be a text channel and the bot must be able to write to it!', EmbedMessageType.Error, 'Could not send interaction message to user');
            return;
          }
          const update = { main_channel_id: channelID };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              sendResponse(interaction, `Main channel is now configured to <#${channelID}>`, EmbedMessageType.Info, 'Could not send interaction message to user');
            })
            .catch((e) => {
              sendCrashResponse(interaction, 'Could not set the new bot config with the database!', e);
            });
          break;
        }

        case 'set.auto-vc': {
          const channelID = interaction.options.getChannel('vc')?.id;
          const cnl = interaction.guild?.channels.cache
            .find((c) => c.id === channelID && c.type === 'GUILD_VOICE');
          if (!cnl) {
            sendResponse(interaction, 'Could not set this channel for auto voice channel monitoring! The channel needs to be a voice channel and the bot must be able to create new voice channels there!', EmbedMessageType.Error, 'Could not send interaction message to user');
            return;
          }
          const update = { auto_vc_channel_id: channelID };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              sendResponse(interaction, `Voice channel monitoring is now configured to <#${channelID}>`, EmbedMessageType.Info, 'Could not send interaction message to user');
            })
            .catch((e) => {
              sendCrashResponse(interaction, 'Could not set the new bot config with the database!', e);
            });
          break;
        }

        case 'set.welcome-message': {
          const msg = interaction.options.getString('welcome-message');
          const update = { welcome_message: msg };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              sendResponse(interaction, 'The new member welcome message has been set!', EmbedMessageType.Success, 'Could not send interaction message to user');
            })
            .catch((e) => {
              sendCrashResponse(interaction, 'Could not set the new bot config with the database!', e);
            });
          break;
        }

        case 'add.admin-user': {
          const userID = interaction.options.getUser('user')?.id;
          const array = await BotGuildConfig
            .find({ guild_id: interaction.guild?.id, admin_users: userID }, { 'admin_users.$': 1 });
          if (array.length > 0) {
            sendResponse(interaction, `User <@${userID}> has already full access to this bot!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
            break;
          }
          const update = { $push: { admin_users: userID } };
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              sendResponse(interaction, `User <@${userID}> has now full access to this bot!`, EmbedMessageType.Info, 'Could not send interaction message to user');
            })
            .catch((e) => {
              sendCrashResponse(interaction, 'Could not set the new bot config with the database!', e);
            });

          break;
        }

        case 'add.admin-role': {
          const roleID = interaction.options.getRole('role')?.id;
          const update = { $push: { admin_roles: roleID } };
          const array = await BotGuildConfig
            .find({ guild_id: interaction.guild?.id, admin_roles: roleID }, { 'admin_roles.$': 1 });
          if (array.length > 0) {
            sendResponse(interaction, `Users under role <@&${roleID}> are already an admin`, EmbedMessageType.Warning, 'Could not send interaction message to user');
            break;
          }
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              sendResponse(interaction, `Users under role <@&${roleID}> have now full access to this bot!`, EmbedMessageType.Info, 'Could not send interaction message to user');
            })
            .catch((e) => {
              sendCrashResponse(interaction, 'Could not set the new bot config with the database!', e);
            });
          break;
        }

        case 'add.base-role': {
          const roleID = interaction.options.getRole('role')?.id;
          const update = { $push: { base_roles: roleID } };
          const array = await BotGuildConfig
            .find({ guild_id: interaction.guild?.id, base_roles: roleID }, { 'base_roles.$': 1 });
          if (array.length > 0) {
            sendResponse(interaction, `Base role <@&${roleID}> is already configured! Cannot add it again!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
            break;
          }
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              sendResponse(interaction, `Base role <@&${roleID}> is now configured!`, EmbedMessageType.Info, 'Could not send interaction message to user');
            })
            .catch((e) => {
              sendCrashResponse(interaction, 'Could not set the new bot config with the database!', e);
            });
          break;
        }

        case 'remove.admin-user': {
          const userID = interaction.options.getUser('user')?.id;
          const array = await BotGuildConfig
            .find({ guild_id: interaction.guild?.id, admin_users: userID }, { 'admin_users.$': 1 });
          if (array.length === 0) {
            sendResponse(interaction, `User <@${userID}> is not yet configured! Cannot remove it!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
            break;
          }
          const update = { $pull: { admin_users: userID } };
          BotGuildConfig.updateOne(query, update, options)
            .then(() => {
              sendResponse(interaction, `User <@${userID}> has no longer full access to this bot!`, EmbedMessageType.Info, 'Could not send interaction message to user');
            })
            .catch((e) => {
              sendCrashResponse(interaction, 'Could not set the new bot config with the database!', e);
            });

          break;
        }

        case 'remove.admin-role': {
          const roleID = interaction.options.getRole('role')?.id;
          const update = { $pull: { admin_roles: roleID } };
          const array = await BotGuildConfig
            .find({ guild_id: interaction.guild?.id, admin_roles: roleID }, { 'admin_roles.$': 1 });
          if (array.length === 0) {
            sendResponse(interaction, `Role <@&${roleID}> is not yet configured! Cannot remove it!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
            break;
          }
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              sendResponse(interaction, `Users under role <@&${roleID}> have no longer full access to this bot!`, EmbedMessageType.Info, 'Could not send interaction message to user');
            })
            .catch((e) => {
              sendCrashResponse(interaction, 'Could not set the new bot config with the database!', e);
            });
          break;
        }

        case 'remove.base-role': {
          const roleID = interaction.options.getRole('role')?.id;
          const update = { $pull: { base_roles: roleID } };
          const array = await BotGuildConfig
            .find({ guild_id: interaction.guild?.id, base_roles: roleID }, { 'base_roles.$': 1 });
          if (array.length === 0) {
            sendResponse(interaction, `Role <@&${roleID}> is not yet configured! Cannot remove it!`, EmbedMessageType.Warning, 'Could not send interaction message to user');
            break;
          }
          BotGuildConfig.findOneAndUpdate(query, update, options)
            .then(() => {
              sendResponse(interaction, `Base user role <@&${roleID}> is not removed from the bot config!`, EmbedMessageType.Info, 'Could not send interaction message to user');
            })
            .catch((e) => {
              sendCrashResponse(interaction, 'Could not set the new bot config with the database!', e);
            });
          break;
        }

        case 'show.config': {
          const config = await BotGuildConfig.findOne(query);
          if (!config) {
            sendResponse(interaction, 'This bot is not configured for this server! The bot could not automatically configure itself for this server! Contact the developer or a database admin!', EmbedMessageType.Error, 'Could not send interaction message to user');
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

            __Base Roles:__
            > ${(!config.base_roles || config.base_roles.length === 0) ? '*None*' : config.base_roles.map((role) => `<@&${role}>`).join(' ')}

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
            errorLog('Could not send interaction message to user\n========================\n%O', e);
          });
          break;
        }

        default: {
          sendCrashResponse(interaction, 'An unrecognized command has been found!', `configBot.cmd.ts has received an unknown command: ${interaction.command}`);
          break;
        }
      }
    } else {
      sendResponse(interaction, 'You do not have permission to configure this bot!', EmbedMessageType.Error, 'Could not send interaction message to user');
    }
  },
};
