import { GuildMemberRoleManager, Interaction } from 'discord.js';
import { errorLog } from '../util/dbg';
import {
  ISelectableRoleOption, SelectableRoleOption,
  SelectableColorRoleOption, ISelectableColorRoleOption,
} from '../schemas';
import { EmbedMessageType, returnCrashMsg, returnEmbed } from '../util/responseGiver';
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
              interaction.reply({
                embeds: [returnEmbed('Your roles have been cleared!', EmbedMessageType.Success)],
                ephemeral: true,
              }).catch((e) => {
                errorLog('Could not send interaction message to user: %O', e);
              });
              return;
            }

            let errFlag = false;
            interaction.values.forEach((r) => {
              memberRoles.add(r).catch(() => {
                errFlag = true;
              });
            });

            if (errFlag) {
              interaction.reply({
                embeds: [returnEmbed('Could not update all the roles for you!', EmbedMessageType.Warning)],
                ephemeral: true,
              }).catch((e) => {
                errorLog('Could not send interaction message to user: %O', e);
              });
            } else {
              interaction.reply({
                embeds: [returnEmbed('Your role selection have been updated!', EmbedMessageType.Success)],
                ephemeral: true,
              }).catch((e) => {
                errorLog('Could not send interaction message to user: %O', e);
              });
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
              interaction.reply({
                embeds: [returnEmbed('Your selectable color roles have been cleared!', EmbedMessageType.Info)],
                ephemeral: true,
              }).catch((e) => {
                errorLog('Could not send interaction message to user: %O', e);
              });
            } else {
              memberRoles.add(roleID)
                .then(() => {
                  interaction.reply({
                    embeds: [returnEmbed(`The color <@&${role?.id}> is now assigned to you!`, EmbedMessageType.Success)],
                    ephemeral: true,
                  }).catch((e) => {
                    errorLog('Could not send interaction message to user: %O', e);
                  });
                }).catch(() => {
                  interaction.reply({
                    embeds: [returnEmbed(`Does not have the permission to assign <@&${role?.id}> to you!`, EmbedMessageType.Error)],
                    ephemeral: true,
                  }).catch((e2) => {
                    errorLog('Could not send interaction message to user: %O', e2);
                  });
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
        errorLog('Could not send interaction message to user: %O', e);
      });
    }
  });
};
