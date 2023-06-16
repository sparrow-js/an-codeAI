import { Controller, Get, Query } from '@nestjs/common';
import { EditService } from './edit.service';

@Controller('edit')
export class EditController {
  constructor(private readonly editService: EditService) {}

  @Get('insertNode')
  insertNode(@Query() query: any): any {
    console.log('*******9', query);
    this.editService.insertNode(query);
    return;
  }

  @Get('watchProject')
  watchProject(@Query() query: any): any {
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

  @Get('getWatchChangeFiles')
  getWatchChangeFiles(): any {
    const res = this.editService.getWatchChangeFiles();
    return {
      status: 1,
      data: {
        files: res,
      },
    };
  }

  @Get('getFilesContent')
  getFilesContent(@Query() query: any): any {
    console.log('*********', query);
    const res = this.editService.getFilesContent(query.files);
    return {
      status: 1,
      data: {
        files: res,
      },
    };
  }
}
