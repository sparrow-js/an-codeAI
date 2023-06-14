import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatgptModule } from './chatgpt/chatgpt.module';
import { EditModule } from './edit/edit.module';
import { VetorStoresModule } from './vetorstores/vetorstores.module';

@Module({
  imports: [ChatgptModule, EditModule, VetorStoresModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
