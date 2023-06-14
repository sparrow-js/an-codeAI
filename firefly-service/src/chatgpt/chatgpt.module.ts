import { Module } from '@nestjs/common';
import { ChatgptController } from './chatgpt.controller';
import { ChatgptService } from './chatgpt.service';
import { EditModule } from 'src/edit/edit.module';
import { VetorStoresModule } from 'src/vetorstores/vetorstores.module';

@Module({
  imports: [EditModule, VetorStoresModule],
  controllers: [ChatgptController],
  providers: [ChatgptService],
})
export class ChatgptModule {}
