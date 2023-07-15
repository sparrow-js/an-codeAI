import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatgptModule } from './chatgpt/chatgpt.module';
import { EditModule } from './edit/edit.module';
import { VetorStoresModule } from './vetorstores/vetorstores.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    ChatgptModule,
    EditModule,
    VetorStoresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
