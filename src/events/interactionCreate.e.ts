import { GuildMemberRoleManager, Interaction } from 'discord.js';
import {
  SelectableColorRoleOption, ISelectableColorRoleOption,
} from '../schemas';
import {
  EmbedMessageType, errorLog, getBaseRoles, returnCrashMsg, sendResponse,
} from '../util';
import { DiscordClient } from '../typings/client';

export default (client: DiscordClient): void => {
  client.on('interactionCreate', async (interaction:Interaction) => {
    try {
      if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;
        await command.execute(interaction, client);
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

      if (interaction.isSelectMenu()) {
        switch (interaction.customId) {
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
