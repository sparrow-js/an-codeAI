import { Module } from '@nestjs/common';
import { ChatgptController } from './chatgpt.controller';
import { ChatgptService } from './chatgpt.service';
import { EditModule } from 'src/edit/edit.module';

@Module({
  imports: [EditModule],
  controllers: [ChatgptController],
  providers: [ChatgptService],
})
export class ChatgptModule {}
