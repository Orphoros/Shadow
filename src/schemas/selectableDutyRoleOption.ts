import {
  model, Schema, Model, Document,
} from 'mongoose';

export interface ISelectableDutyRoleOption extends Document {
    guild_id: string;
    duty_role_id: string;
    duty_description?: string;
    duty_emoji?: string;
  }

const schema: Schema = new Schema({
  guild_id: {
    type: String,
    required: true,
  },
  duty_role_id: {
    type: String,
    required: true,
  },
  duty_description: {
    type: String,
    required: false,
  },
  duty_emoji: {
    type: String,
    required: false,
  },
});

schema.index({ guild_id: 1, duty_role_id: 1 }, { unique: true });

export const SelectableDutyRoleOption: Model<ISelectableDutyRoleOption> = model<ISelectableDutyRoleOption>('SELECTABLE_ROLES_DUTY', schema, 'SELECTABLE_ROLES_DUTY');
