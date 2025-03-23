import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Analytics extends Document {
  @Prop()
  alias: string;

  @Prop()
  totalClicks: number;

  @Prop()
  ipAddress: string;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop()
  topic: string;

  @Prop()
  osName: string;

  @Prop()
  deviceName: string;

  @Prop()
  browser: string;

  createdAt: Date;

  updatedAt: Date;
}
//automatically generates a Mongoose schema from a TypeScript class (MyClass) using decorators, simplifying schema definition
const AnalyticsSchema = SchemaFactory.createForClass(Analytics);

AnalyticsSchema.index({ alias: 1 });
AnalyticsSchema.index({ topic: 1 });
AnalyticsSchema.index({ createdAt: 1 });

export { AnalyticsSchema };
