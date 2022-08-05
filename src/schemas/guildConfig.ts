import {
  model, Schema, Model, Document,
} from 'mongoose';

export interface IBotGuildConfig extends Document {
    guild_id?: string;
    welcome_channel_id?: string;
    announcement_channel_id?: string;
    main_channel_id?: string;
    rules_channel_id?: string;
    introduction_channel_id?: string;
    admin_users?: string[];
    admin_roles?: string[];
    auto_vc_channel_name?: string;
  }

const schema: Schema = new Schema({
  guild_id: {
    type: String,
    required: true,
    nullable: false,
    unique: true,
  },
  welcome_channel_id: {
    type: String,
    required: false,
    nullable: true,
  },
  introduction_channel_id: {
    type: String,
    required: false,
    nullable: true,
  },
  announcement_channel_id: {
    type: String,
    required: false,
    nullable: true,
  },
  rules_channel_id: {
    type: String,
    required: false,
    nullable: true,
  },
  main_channel_id: {
    type: String,
    required: false,
    nullable: true,
  },
  admin_users: {
    type: [String],
    required: false,
    nullable: true,
  },
  admin_roles: {
    type: [String],
    required: false,
    nullable: true,
  },
  auto_vc_channel_name: {
    type: String,
    required: false,
    nullable: true,
  },
});

export const BotGuildConfig: Model<IBotGuildConfig> = model<IBotGuildConfig>('BOT_CONFIG_GUILD', schema, 'BOT_CONFIG_GUILD');
