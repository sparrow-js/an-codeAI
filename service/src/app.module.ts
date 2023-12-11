import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
const envFilePath = ['.env'];
export const IS_DEV = process.env.RUNNING_ENV !== 'prod';
if (IS_DEV) {
  envFilePath.unshift('.env.dev');
} else {
  envFilePath.unshift('.env.prod');
}
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    EventsModule
  ],
})
export class AppModule {}
