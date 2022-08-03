import {
  model, Schema, Model, Document,
} from 'mongoose';

export interface ISelectableRoleOption extends Document {
  guild_id: string;
  role_id: string;
  role_description?: string;
  role_emoji?: string;
}

const schema: Schema = new Schema({
  guild_id: {
    type: String,
    required: true,
  },
  role_id: {
    type: String,
    required: true,
  },
  role_description: {
    type: String,
    required: false,
  },
  role_emoji: {
    type: String,
    required: false,
  },
});

schema.index({ guild_id: 1, role_id: 1 }, { unique: true });

export const SelectableRoleOption: Model<ISelectableRoleOption> = model<ISelectableRoleOption>('SELECTABLE_ROLES', schema, 'SELECTABLE_ROLES');
