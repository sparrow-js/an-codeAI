import { Controller, Get, Query } from '@nestjs/common';
import { EditService } from './edit.service';

@Controller('edit')
export class EditController {
  constructor(private readonly editService: EditService) {}

  @Get()
  test(): string {
    this.editService.testCode();
    return;
  }

  @Get('insertNode')
  insertNode(@Query() query: any): any {
    console.log('*******9', query);
    this.editService.insertNode(query);
    return;
  }
}
