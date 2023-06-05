import { Module } from '@nestjs/common';
import { EditService } from './edit.service';
import { EditController } from './edit.controller';

@Module({
  providers: [EditService],
  controllers: [EditController],
  exports: [EditService],
})
export class EditModule {}
