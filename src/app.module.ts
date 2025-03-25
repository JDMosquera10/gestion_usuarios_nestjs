import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/users/user.module';
import { DatabaseModule } from './config/database.module';
import { GlobalHelper } from './helpers/global.helper';
import { HelpersModule } from './helpers/helpers.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [DatabaseModule, UserModule, ConfigModule.forRoot(), HelpersModule],
  controllers: [AppController],
  providers: [AppService, GlobalHelper]
})
export class AppModule { }
