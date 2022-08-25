import {
  model, Schema, Model, Document,
} from 'mongoose';

export interface ISelectableRegionRoleOption extends Document {
  guild_id: string;
  region_role_id: string;
  region_description?: string;
  region_emoji?: string;
}

const schema: Schema = new Schema({
  guild_id: {
    type: String,
    required: true,
  },
  region_role_id: {
    type: String,
    required: true,
  },
  region_description: {
    type: String,
    required: false,
  },
  region_emoji: {
    type: String,
    required: false,
  },
});

schema.index({ guild_id: 1, region_role_id: 1 }, { unique: true });

export const SelectableRegionRoleOption: Model<ISelectableRegionRoleOption> = model<ISelectableRegionRoleOption>('SELECTABLE_ROLES_REGION', schema, 'SELECTABLE_ROLES_REGION');
