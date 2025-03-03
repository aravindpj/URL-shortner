import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Url extends Document {
  @Prop({ required: true })
  longUrl: string;

  @Prop()
  shortId: string;

  @Prop()
  alias: string;

  @Prop()
  topic: string;
}

export const UrlSchema = SchemaFactory.createForClass(Url);
