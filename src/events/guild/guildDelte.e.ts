import { DiscordClient } from '../../typings/client';
import { errorLog, eventLog } from '../../util';
import {
  BotGuildConfig, SelectableAgeRoleOption, SelectableColorRoleOption,
  SelectableDMRoleOption, SelectableDutyRoleOption, SelectableJobRoleOption,
  SelectablePingRoleOption, SelectablePronounRoleOption, SelectableRegionRoleOption,
  SelectableSubgenreRoleOption,
} from '../../schemas';

export default (client: DiscordClient): void => {
  client.on('guildDelete', (guild) => {
    eventLog(`Guild left: ${guild.name} (${guild.id})`);
    const query = {
      guild_id: guild?.id,
    };

    BotGuildConfig.findOneAndDelete(query)
      .then(() => {
        eventLog(`Removed guild config for "${guild.name}" (${guild.id})`);
      })
      .catch((e) => {
        eventLog(`Could not remove guild config for "${guild.name}" (${guild.id})`);
        errorLog('DB error\n========================\n%O', e);
      });

    // TODO: check if existence is needed
    SelectableAgeRoleOption.deleteMany({ guild_id: guild?.id })
      .then(() => {
        eventLog(`Removed guild selectable age role options for "${guild.name}" (${guild.id})`);
      })
      .catch((e) => {
        eventLog(`Could not remove guild selectable age role options for "${guild.name}" (${guild.id})`);
        errorLog('DB error\n========================\n%O', e);
      });

    SelectableColorRoleOption.deleteMany({ guild_id: guild?.id })
      .then(() => {
        eventLog(`Removed guild selectable color role options for "${guild.name}" (${guild.id})`);
      })
      .catch((e) => {
        eventLog(`Could not remove guild selectable color role options for "${guild.name}" (${guild.id})`);
        errorLog('DB error\n========================\n%O', e);
      });

    SelectableDMRoleOption.deleteMany({ guild_id: guild?.id })
      .then(() => {
        eventLog(`Removed guild selectable DM role options for "${guild.name}" (${guild.id})`);
      })
      .catch((e) => {
        eventLog(`Could not remove guild selectable Dm role options for "${guild.name}" (${guild.id})`);
        errorLog('DB error\n========================\n%O', e);
      });

    SelectableDutyRoleOption.deleteMany({ guild_id: guild?.id })
      .then(() => {
        eventLog(`Removed guild selectable duty role options for "${guild.name}" (${guild.id})`);
      })
      .catch((e) => {
        eventLog(`Could not remove guild selectable duty role options for "${guild.name}" (${guild.id})`);
        errorLog('DB error\n========================\n%O', e);
      });

    SelectablePingRoleOption.deleteMany({ guild_id: guild?.id })
      .then(() => {
        eventLog(`Removed guild selectable ping role options for "${guild.name}" (${guild.id})`);
      })
      .catch((e) => {
        eventLog(`Could not remove guild selectable ping role options for "${guild.name}" (${guild.id})`);
        errorLog('DB error\n========================\n%O', e);
      });

    SelectableJobRoleOption.deleteMany({ guild_id: guild?.id })
      .then(() => {
        eventLog(`Removed guild selectable job role options for "${guild.name}" (${guild.id})`);
      })
      .catch((e) => {
        eventLog(`Could not remove guild selectable job role options for "${guild.name}" (${guild.id})`);
        errorLog('DB error\n========================\n%O', e);
      });

    SelectablePronounRoleOption.deleteMany({ guild_id: guild?.id })
      .then(() => {
        eventLog(`Removed guild selectable pronoun role options for "${guild.name}" (${guild.id})`);
      })
      .catch((e) => {
        eventLog(`Could not remove guild selectable pronoun role options for "${guild.name}" (${guild.id})`);
        errorLog('DB error\n========================\n%O', e);
      });

    SelectableRegionRoleOption.deleteMany({ guild_id: guild?.id })
      .then(() => {
        eventLog(`Removed guild selectable region role options for "${guild.name}" (${guild.id})`);
      })
      .catch((e) => {
        eventLog(`Could not remove guild selectable region role options for "${guild.name}" (${guild.id})`);
        errorLog('DB error\n========================\n%O', e);
      });

    SelectableSubgenreRoleOption.deleteMany({ guild_id: guild?.id })
      .then(() => {
        eventLog(`Removed guild selectable subgenre role options for "${guild.name}" (${guild.id})`);
      })
      .catch((e) => {
        eventLog(`Could not remove guild selectable subgenre role options for "${guild.name}" (${guild.id})`);
        errorLog('DB error\n========================\n%O', e);
      });
  });
};
