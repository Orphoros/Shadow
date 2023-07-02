import {
  model, Schema, Model, Document,
} from 'mongoose';

export interface ISelectableJobRoleOption extends Document {
  guild_id: string;
  job_role_id: string;
  job_description?: string;
  job_emoji?: string;
}

const schema: Schema = new Schema({
  guild_id: {
    type: String,
    required: true,
  },
  job_role_id: {
    type: String,
    required: true,
  },
  job_description: {
    type: String,
    required: false,
  },
  job_emoji: {
    type: String,
    required: false,
  },
});

schema.index({ guild_id: 1, job_role_id: 1 }, { unique: true });

export const SelectableJobRoleOption: Model<ISelectableJobRoleOption> = model<ISelectableJobRoleOption>('SELECTABLE_ROLES_JOB', schema, 'SELECTABLE_ROLES_JOB');
