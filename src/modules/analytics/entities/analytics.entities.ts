import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Analytics extends Document {
  @Prop()
  shortId: string;

  @Prop()
  totalClicks: number;

  // @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  // userId: Types.ObjectId;

  // @Prop()
  // uniqueUsers: number;
  @Prop()
  alias: string;

  @Prop()
  osName: string;

  @Prop()
  deviceName: string;

  @Prop()
  browser: string;
}
//automatically generates a Mongoose schema from a TypeScript class (MyClass) using decorators, simplifying schema definition
export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);
