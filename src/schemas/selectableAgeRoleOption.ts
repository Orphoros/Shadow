import {
  model, Schema, Model, Document,
} from 'mongoose';

export interface ISelectableAgeRoleOption extends Document {
  guild_id: string;
  age_role_id: string;
  age_description?: string;
  age_emoji?: string;
}

const schema: Schema = new Schema({
  guild_id: {
    type: String,
    required: true,
  },
  age_role_id: {
    type: String,
    required: true,
  },
  age_description: {
    type: String,
    required: false,
  },
  age_emoji: {
    type: String,
    required: false,
  },
});

schema.index({ guild_id: 1, age_role_id: 1 }, { unique: true });

export const SelectableAgeRoleOption: Model<ISelectableAgeRoleOption> = model<ISelectableAgeRoleOption>('SELECTABLE_ROLES_AGE', schema, 'SELECTABLE_ROLES_AGE');
