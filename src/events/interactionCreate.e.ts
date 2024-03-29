import { GuildMemberRoleManager, Interaction } from 'discord.js';
import {
  ISelectableColorRoleOption, SelectableColorRoleOption,
  ISelectableAgeRoleOption, SelectableAgeRoleOption,
  ISelectableRegionRoleOption, SelectableRegionRoleOption,
  ISelectableDMRoleOption, SelectableDMRoleOption,
  ISelectablePronounRoleOption, SelectablePronounRoleOption,
  ISelectablePingRoleOption, SelectablePingRoleOption,
  ISelectableSubgenreRoleOption, SelectableSubgenreRoleOption,
  ISelectableDutyRoleOption, SelectableDutyRoleOption,
  ISelectableJobRoleOption, SelectableJobRoleOption,
} from '../schemas';
import {
  EmbedMessageType, errorLog, getBaseRoles, isInteractionUserMod, returnCrashMsg, sendResponse,
} from '../util';
import { DiscordClient } from '../typings/client';

export default (client: DiscordClient): void => {
  client.on('interactionCreate', async (interaction:Interaction) => {
    try {
      if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;
        // TODO: Add support for other types of interaction types (e.g. context menu)
        if (interaction.isChatInputCommand()) {
          await command.execute(interaction, client);
        }
      }

      if (interaction.isButton()) {
        switch (interaction.customId) {
          case 'btn-accept-rules': {
            const memberRoles = interaction.member?.roles as GuildMemberRoleManager;
            const roles = await getBaseRoles(interaction.guildId ?? '');

            if (roles.length === 0) {
              sendResponse(interaction, 'Thank you for accepting the rules. \n\nPlease note that the bot is not configured to change your permissions. Ask an admin for help!', EmbedMessageType.Warning, 'Could not send interaction message to user');
              return;
            }

            let errFlag = false;
            roles.forEach((role) => {
              if (!memberRoles.cache.has(role)) {
                memberRoles.add(role).catch(() => {
                  errFlag = true;
                });
              }
            });
            if (errFlag) {
              sendResponse(interaction, 'Could not assign all required roles for you! Please contact the admins.', EmbedMessageType.Warning, 'Could not send interaction message to user');
            } else {
              sendResponse(interaction, 'Thank you for accepting the rules! Welcome!', EmbedMessageType.Success, 'Could not send interaction message to user');
            }
            break;
          }

          default: return;
        }
      }

      if (interaction.isStringSelectMenu()) {
        switch (interaction.customId) {
          case 'reaction-dm': {
            const roleID = interaction.values[0];
            const role = interaction.guild?.roles.cache.get(roleID);
            const memberRoles = interaction.member?.roles as GuildMemberRoleManager;
            const roleOptions: ISelectableDMRoleOption[] = await SelectableDMRoleOption.find({
              guild_id: interaction.guild?.id,
            }).exec();
            roleOptions.forEach((r) => {
              if (memberRoles.cache.has(r.dm_role_id)) {
                memberRoles.remove(r.dm_role_id);
              }
            });
            if (roleID === '-1') {
              sendResponse(interaction, 'Your selectable DM role has been cleared!', EmbedMessageType.Info, 'Could not send interaction message to user');
            } else {
              memberRoles.add(roleID)
                .then(() => {
                  sendResponse(interaction, `The DM role <@&${role?.id}> is now assigned to you!`, EmbedMessageType.Success, 'Could not send interaction message to user');
                }).catch(() => {
                  sendResponse(interaction, `Could not assign <@&${role?.id}> to you! Inform the admins and try again later!`, EmbedMessageType.Error, 'Could not send interaction message to user');
                });
            }
            break;
          }

          case 'reaction-pronoun': {
            const memberRoles = interaction.member?.roles as GuildMemberRoleManager;
            const roleOptions: ISelectablePronounRoleOption[] = await SelectablePronounRoleOption
              .find({
                guild_id: interaction.guild?.id,
              }).exec();
            roleOptions.forEach((r) => {
              if (memberRoles.cache.has(r.pronoun_role_id)) {
                memberRoles.remove(r.pronoun_role_id);
              }
            });
            if (interaction.values.length === 0) {
              sendResponse(interaction, 'Your selectable pronoun roles have been cleared!', EmbedMessageType.Info, 'Could not send interaction message to user');
              return;
            }
            let errFlag = false;
            interaction.values.forEach((r) => {
              memberRoles.add(r).catch(() => {
                errFlag = true;
              });
            });
            if (errFlag) {
              sendResponse(interaction, 'Could not update all the pronoun roles for you!', EmbedMessageType.Warning, 'Could not send interaction message to user');
            } else {
              sendResponse(interaction, 'Your pronoun role selection has been updated!', EmbedMessageType.Success, 'Could not send interaction message to user');
            }
            break;
          }

          case 'reaction-subgenre': {
            const memberRoles = interaction.member?.roles as GuildMemberRoleManager;
            const roleOptions: ISelectableSubgenreRoleOption[] = await SelectableSubgenreRoleOption
              .find({
                guild_id: interaction.guild?.id,
              }).exec();
            roleOptions.forEach((r) => {
              if (memberRoles.cache.has(r.subgenre_role_id)) {
                memberRoles.remove(r.subgenre_role_id);
              }
            });
            if (interaction.values.length === 0) {
              sendResponse(interaction, 'Your selectable subgenre roles have been cleared!', EmbedMessageType.Info, 'Could not send interaction message to user');
              return;
            }
            let errFlag = false;
            interaction.values.forEach((r) => {
              memberRoles.add(r).catch(() => {
                errFlag = true;
              });
            });
            if (errFlag) {
              sendResponse(interaction, 'Could not update all the subgenre roles for you!', EmbedMessageType.Warning, 'Could not send interaction message to user');
            } else {
              sendResponse(interaction, 'Your subgenre role selection has been updated!', EmbedMessageType.Success, 'Could not send interaction message to user');
            }
            break;
          }

          case 'reaction-ping': {
            const memberRoles = interaction.member?.roles as GuildMemberRoleManager;
            const roleOptions: ISelectablePingRoleOption[] = await SelectablePingRoleOption
              .find({
                guild_id: interaction.guild?.id,
              }).exec();
            roleOptions.forEach((r) => {
              if (memberRoles.cache.has(r.ping_role_id)) {
                memberRoles.remove(r.ping_role_id);
              }
            });
            if (interaction.values.length === 0) {
              sendResponse(interaction, 'Your selectable ping roles have been cleared!', EmbedMessageType.Info, 'Could not send interaction message to user');
              return;
            }
            let errFlag = false;
            interaction.values.forEach((r) => {
              memberRoles.add(r).catch(() => {
                errFlag = true;
              });
            });
            if (errFlag) {
              sendResponse(interaction, 'Could not update all the ping roles for you!', EmbedMessageType.Warning, 'Could not send interaction message to user');
            } else {
              sendResponse(interaction, 'Your ping role selection has been updated!', EmbedMessageType.Success, 'Could not send interaction message to user');
            }
            break;
          }

          case 'reaction-job': {
            const memberRoles = interaction.member?.roles as GuildMemberRoleManager;
            const roleOptions: ISelectableJobRoleOption[] = await SelectableJobRoleOption
              .find({
                guild_id: interaction.guild?.id,
              }).exec();
            roleOptions.forEach((r) => {
              if (memberRoles.cache.has(r.job_role_id)) {
                memberRoles.remove(r.job_role_id);
              }
            });
            if (interaction.values.length === 0) {
              sendResponse(interaction, 'Your selectable job roles have been cleared!', EmbedMessageType.Info, 'Could not send interaction message to user');
              return;
            }
            let errFlag = false;
            interaction.values.forEach((r) => {
              memberRoles.add(r).catch(() => {
                errFlag = true;
              });
            });
            if (errFlag) {
              sendResponse(interaction, 'Could not update all the job roles for you!', EmbedMessageType.Warning, 'Could not send interaction message to user');
            } else {
              sendResponse(interaction, 'Your job role selection has been updated!', EmbedMessageType.Success, 'Could not send interaction message to user');
            }
            break;
          }

          case 'reaction-colors': {
            const roleID = interaction.values[0];
            const role = interaction.guild?.roles.cache.get(roleID);
            const memberRoles = interaction.member?.roles as GuildMemberRoleManager;
            const roleOptions: ISelectableColorRoleOption[] = await SelectableColorRoleOption.find({
              guild_id: interaction.guild?.id,
            }).exec();
            roleOptions.forEach((r) => {
              if (memberRoles.cache.has(r.color_role_id)) {
                memberRoles.remove(r.color_role_id);
              }
            });
            if (roleID === '-1') {
              sendResponse(interaction, 'Your selectable color roles have been cleared!', EmbedMessageType.Info, 'Could not send interaction message to user');
            } else {
              memberRoles.add(roleID)
                .then(() => {
                  sendResponse(interaction, `The color <@&${role?.id}> is now assigned to you!`, EmbedMessageType.Success, 'Could not send interaction message to user');
                }).catch(() => {
                  sendResponse(interaction, `Could not assign <@&${role?.id}> to you! Inform the admins and try again later!`, EmbedMessageType.Error, 'Could not send interaction message to user');
                });
            }
            break;
          }

          case 'reaction-duty': {
            const roleID = interaction.values[0];
            const role = interaction.guild?.roles.cache.get(roleID);
            const memberRoles = interaction.member?.roles as GuildMemberRoleManager;
            if (await isInteractionUserMod(interaction)) {
              const roleOptions: ISelectableDutyRoleOption[] = await SelectableDutyRoleOption.find({
                guild_id: interaction.guild?.id,
              }).exec();
              roleOptions.forEach((r) => {
                if (memberRoles.cache.has(r.duty_role_id)) {
                  memberRoles.remove(r.duty_role_id);
                }
              });
              if (roleID === '-1') {
                sendResponse(interaction, 'Your selectable duty role has been cleared!', EmbedMessageType.Info, 'Could not send interaction message to user');
              } else {
                memberRoles.add(roleID)
                  .then(() => {
                    sendResponse(interaction, `The duty role <@&${role?.id}> is now assigned to you!`, EmbedMessageType.Success, 'Could not send interaction message to user');
                  }).catch(() => {
                    sendResponse(interaction, `Could not assign <@&${role?.id}> to you! Inform the admins and try again later!`, EmbedMessageType.Error, 'Could not send interaction message to user');
                  });
              }
            } else {
              sendResponse(interaction, 'Only moderators can interact with this menu!', EmbedMessageType.Error, 'Could not send interaction message to user');
            }
            break;
          }

          case 'reaction-age': {
            const roleID = interaction.values[0];
            const role = interaction.guild?.roles.cache.get(roleID);
            const memberRoles = interaction.member?.roles as GuildMemberRoleManager;
            const roleOptions: ISelectableAgeRoleOption[] = await SelectableAgeRoleOption.find({
              guild_id: interaction.guild?.id,
            }).exec();
            roleOptions.forEach((r) => {
              if (memberRoles.cache.has(r.age_role_id)) {
                memberRoles.remove(r.age_role_id);
              }
            });
            if (roleID === '-1') {
              sendResponse(interaction, 'Your selectable age role has been cleared!', EmbedMessageType.Info, 'Could not send interaction message to user');
            } else {
              memberRoles.add(roleID)
                .then(() => {
                  sendResponse(interaction, `The age <@&${role?.id}> is now assigned to you!`, EmbedMessageType.Success, 'Could not send interaction message to user');
                }).catch(() => {
                  sendResponse(interaction, `Could not assign <@&${role?.id}> to you! Inform the admins and try again later!`, EmbedMessageType.Error, 'Could not send interaction message to user');
                });
            }
            break;
          }

          case 'reaction-region': {
            const roleID = interaction.values[0];
            const role = interaction.guild?.roles.cache.get(roleID);
            const memberRoles = interaction.member?.roles as GuildMemberRoleManager;
            const roleOptions: ISelectableRegionRoleOption[] = await SelectableRegionRoleOption
              .find({
                guild_id: interaction.guild?.id,
              }).exec();
            roleOptions.forEach((r) => {
              if (memberRoles.cache.has(r.region_role_id)) {
                memberRoles.remove(r.region_role_id);
              }
            });
            if (roleID === '-1') {
              sendResponse(interaction, 'Your selectable region role has been cleared!', EmbedMessageType.Info, 'Could not send interaction message to user');
            } else {
              memberRoles.add(roleID)
                .then(() => {
                  sendResponse(interaction, `The region <@&${role?.id}> is now assigned to you!`, EmbedMessageType.Success, 'Could not send interaction message to user');
                }).catch(() => {
                  sendResponse(interaction, `Could not assign <@&${role?.id}> to you! Inform the admins and try again later!`, EmbedMessageType.Error, 'Could not send interaction message to user');
                });
            }
            break;
          }

          default: return;
        }
      }
    } catch (err) {
      errorLog(err);
      await interaction.channel?.send({
        embeds: [returnCrashMsg('The bot could not execute a slash command!', err)],
      }).catch((e) => {
        errorLog('Could not send interaction message to user\n========================\n%O', e);
      });
    }
  });
};
