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

  @Get('watchProject')
  watchProject(@Query() query: any): any {
    console.log('*******10', query);
    this.editService.watchProject(query.dir);
    return {
      status: 1,
    };
  }

  @Get('getProjectRootPath')
  getProjectRootPath(@Query() query: any): any {
    const res = this.editService.getProjectRootPath(query.path);
    return {
      status: 1,
      data: {
        rootDir: res,
      },
    };
  }
}
