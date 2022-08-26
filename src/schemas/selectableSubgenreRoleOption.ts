import {
  model, Schema, Model, Document,
} from 'mongoose';

export interface ISelectableSubgenreRoleOption extends Document {
  guild_id: string;
  subgenre_role_id: string;
  subgenre_description?: string;
  subgenre_emoji?: string;
}

const schema: Schema = new Schema({
  guild_id: {
    type: String,
    required: true,
  },
  subgenre_role_id: {
    type: String,
    required: true,
  },
  subgenre_description: {
    type: String,
    required: false,
  },
  subgenre_emoji: {
    type: String,
    required: false,
  },
});

schema.index({ guild_id: 1, subgenre_role_id: 1 }, { unique: true });

export const SelectableSubgenreRoleOption: Model<ISelectableSubgenreRoleOption> = model<ISelectableSubgenreRoleOption>('SELECTABLE_ROLES_SUBGENRE', schema, 'SELECTABLE_ROLES_SUBGENRE');
