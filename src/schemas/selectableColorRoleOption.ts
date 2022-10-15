import {
  model, Schema, Model, Document,
} from 'mongoose';

export interface ISelectableColorRoleOption extends Document {
  guild_id: string;
  color_role_id: string;
  menu_id: string;
  color_description?: string;
  color_emoji?: string;
}

const schema: Schema = new Schema({
  guild_id: {
    type: String,
    required: true,
  },
  color_role_id: {
    type: String,
    required: true,
  },
  color_description: {
    type: String,
    required: false,
  },
  color_emoji: {
    type: String,
    required: false,
  },
  menu_id: {
    type: String,
    required: true,
  },
});

schema.index({ guild_id: 1, color_role_id: 1 }, { unique: true });

export const SelectableColorRoleOption: Model<ISelectableColorRoleOption> = model<ISelectableColorRoleOption>('SELECTABLE_ROLES_COLOR', schema, 'SELECTABLE_ROLES_COLOR');
