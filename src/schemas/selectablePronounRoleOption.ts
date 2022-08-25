import {
  model, Schema, Model, Document,
} from 'mongoose';

export interface ISelectablePronounRoleOption extends Document {
  guild_id: string;
  pronoun_role_id: string;
  pronoun_description?: string;
  pronoun_emoji?: string;
}

const schema: Schema = new Schema({
  guild_id: {
    type: String,
    required: true,
  },
  pronoun_role_id: {
    type: String,
    required: true,
  },
  pronoun_description: {
    type: String,
    required: false,
  },
  pronoun_emoji: {
    type: String,
    required: false,
  },
});

schema.index({ guild_id: 1, pronoun_role_id: 1 }, { unique: true });

export const SelectablePronounRoleOption: Model<ISelectablePronounRoleOption> = model<ISelectablePronounRoleOption>('SELECTABLE_ROLES_PRONOUN', schema, 'SELECTABLE_ROLES_PRONOUN');
