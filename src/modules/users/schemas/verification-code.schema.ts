import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) // Habilita `createdAt` y `updatedAt`
export class VerificationCode extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true, default: () => new Date(Date.now() + 10 * 60 * 1000) })
  expiresAt: Date;
}

export const VerificationCodeSchema = SchemaFactory.createForClass(VerificationCode);
