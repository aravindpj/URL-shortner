import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class Users extends Document {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: [true, 'password is required'], select: false })
  password: string;

  @Prop({
    required: [true, 'please confirm password'],
    validate: {
      //  Explicitly typing this inside the validator (this: User or this: IUser) ensures TypeScript
      //  understands what this refers to.
      validator: function (this: Users, val: string) {
        return val === this.password;
      },

      message: 'password does not match',
    },
    select: false,
  })
  confirmPassword: string;

  createdAt: Date;

  updatedAt: Date;

  checkPasswordIsCorrect: (password: string) => Promise<boolean>;
}

export const UsersSchema = SchemaFactory.createForClass(Users);

UsersSchema.pre('save', async function (next) {
  //Prevents re-hashing an already hashed password on every save
  if (!this.isModified('password')) return next();
  const saltOrRounds = 10;
  this.password = await bcrypt.hash(this.password, saltOrRounds);
  this.confirmPassword = '';
  next();
});

UsersSchema.methods.checkPasswordIsCorrect = async function (
  this: Users,
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};
