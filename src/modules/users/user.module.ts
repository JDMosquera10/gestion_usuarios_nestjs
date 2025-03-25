import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UserModel, UserSchema } from './schemas/user.schema';
import { VerificationCode, VerificationCodeSchema } from './schemas/verification-code.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: VerificationCode.name, schema: VerificationCodeSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UserModule { }
