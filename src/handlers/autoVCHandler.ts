import {
  Guild, GuildMember, VoiceBasedChannel,
} from 'discord.js';
import { dbgLog } from '../util';
import { DiscordClient } from '../typings/client';

type GuildVC = {
    guildID: string;
    vc: VoiceBasedChannel;
}

export class AutoVCManager {
  private listOfVC: GuildVC[];

  constructor() {
    this.listOfVC = [];
  }

  private isDeletable(gvc: GuildVC) {
    return gvc.vc.members.size === 0
    && this.listOfVC
      .find((e) => e.guildID === gvc.guildID && e.vc.id === gvc.vc.id)?.vc.members.size === 0;
  }

  private async cleanUpVC(gvc: GuildVC) {
    if (this.isDeletable(gvc)) {
      dbgLog('Deleting VC: %o', gvc.vc.name);
      this.listOfVC.forEach((v) => {
        dbgLog('List element: %o', v.vc.id);
      });
      return gvc.vc.delete()
        .then((c) => {
          this.listOfVC = this.listOfVC
            .filter((e) => e.guildID === gvc.guildID && e.vc.id !== gvc.vc.id);
          Promise.resolve(c);
        })
        .catch((e) => Promise.reject(e));
    }
    return Promise.resolve(false);
  }

  public async cleanUp(guild: Guild) {
    this.listOfVC.forEach((vc) => {
      if (vc.guildID === guild.id) {
        this.cleanUpVC(vc);
      }
    });
  }

  public async createVC(guild: Guild, vc: VoiceBasedChannel, member: GuildMember) {
    return guild.channels
      .create(`🗣️ ${member.user.username}`, {
        type: 'GUILD_VOICE',
        parent: vc.parent?.id,
      })
      .then(async (c) => {
        this.listOfVC.push({ guildID: guild.id, vc: c });
        return member.voice.setChannel(c)
          .then(() => Promise.resolve(c))
          .catch((e) => Promise.reject(e));
      })
      .catch((e) => Promise.reject(new Error(e)));
  }
}

export function initAutoVCHandler(client: DiscordClient) {
  if (!client.vcManager) {
    client.vcManager = new AutoVCManager();
  }
}
