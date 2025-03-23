import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Url extends Document {
  @Prop({ required: true })
  longUrl: string;

  @Prop()
  shortId: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop()
  alias: string;

  @Prop()
  topic: string;

  createdAt: Date;

  updatedAt: Date;
}

export const UrlSchema = SchemaFactory.createForClass(Url);
