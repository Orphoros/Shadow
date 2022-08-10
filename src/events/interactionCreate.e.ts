import { GuildMemberRoleManager, Interaction } from 'discord.js';
import {
  ISelectableRoleOption, SelectableRoleOption,
  SelectableColorRoleOption, ISelectableColorRoleOption,
} from '../schemas';
import {
  EmbedMessageType, errorLog, returnCrashMsg, sendResponse,
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

      if (interaction.isSelectMenu()) {
        switch (interaction.customId) {
          case 'reaction-roles': {
            const memberRoles = interaction.member?.roles as GuildMemberRoleManager;
            const roleOptions: ISelectableRoleOption[] = await SelectableRoleOption.find({
              guild_id: interaction.guild?.id,
            }).exec();
            roleOptions.forEach((r) => {
              if (memberRoles.cache.has(r.role_id)) {
                memberRoles.remove(r.role_id);
              }
            });
            if (interaction.values.length === 0) {
              sendResponse(interaction, 'Your roles have been cleared!', EmbedMessageType.Success, 'Could not send interaction message to user');
              return;
            }
            let errFlag = false;
            interaction.values.forEach((r) => {
              memberRoles.add(r).catch(() => {
                errFlag = true;
              });
            });
            if (errFlag) {
              sendResponse(interaction, 'Could not update all the roles for you!', EmbedMessageType.Warning, 'Could not send interaction message to user');
            } else {
              sendResponse(interaction, 'Your role selection have been updated!', EmbedMessageType.Success, 'Could not send interaction message to user');
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
                  sendResponse(interaction, `Does not have the permission to assign <@&${role?.id}> to you!`, EmbedMessageType.Error, 'Could not send interaction message to user');
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
