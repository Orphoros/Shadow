import {
  model, Schema, Model, Document,
} from 'mongoose';

export interface ISelectablePingRoleOption extends Document {
  guild_id: string;
  ping_role_id: string;
  ping_description?: string;
  ping_emoji?: string;
}

const schema: Schema = new Schema({
  guild_id: {
    type: String,
    required: true,
  },
  ping_role_id: {
    type: String,
    required: true,
  },
  ping_description: {
    type: String,
    required: false,
  },
  ping_emoji: {
    type: String,
    required: false,
  },
});

schema.index({ guild_id: 1, ping_role_id: 1 }, { unique: true });

export const SelectablePingRoleOption: Model<ISelectablePingRoleOption> = model<ISelectablePingRoleOption>('SELECTABLE_ROLES_PING', schema, 'SELECTABLE_ROLES_PING');
