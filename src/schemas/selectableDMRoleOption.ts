import {
  model, Schema, Model, Document,
} from 'mongoose';

export interface ISelectableDMRoleOption extends Document {
  guild_id: string;
  dm_role_id: string;
  dm_description?: string;
  dm_emoji?: string;
}

const schema: Schema = new Schema({
  guild_id: {
    type: String,
    required: true,
  },
  dm_role_id: {
    type: String,
    required: true,
  },
  dm_description: {
    type: String,
    required: false,
  },
  dm_emoji: {
    type: String,
    required: false,
  },
});

schema.index({ guild_id: 1, dm_role_id: 1 }, { unique: true });

export const SelectableDMRoleOption: Model<ISelectableDMRoleOption> = model<ISelectableDMRoleOption>('SELECTABLE_ROLES_DM', schema, 'SELECTABLE_ROLES_DM');
