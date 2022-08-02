import {
  model, Schema, Model, Document, Types,
} from 'mongoose';

export interface IBotStatusConfig extends Document {
  _id: Types.ObjectId;
  status_type?: number;
  status_msg?: string;
  status_activity?: number;
}

const schema: Schema = new Schema({
  _id: {
    type: Number,
    required: true,
    nullable: false,
  },
  status_type: {
    type: Number,
    required: false,
    nullable: false,
    default: 1,
    min: 1,
    max: 4,
  },
  status_msg: {
    type: String,
    required: true,
    nullable: false,
  },
  status_activity: {
    type: Number,
    required: false,
    nullable: false,
  },
});

export const BotStatusConfig: Model<IBotStatusConfig> = model<IBotStatusConfig>('BOT_CONFIG_STATUS', schema, 'BOT_CONFIG_STATUS');
