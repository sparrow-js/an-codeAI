import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatgptModule } from './chatgpt/chatgpt.module';
import { EditModule } from './edit/edit.module';

@Module({
  imports: [ChatgptModule, EditModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
