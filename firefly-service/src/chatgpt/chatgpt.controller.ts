import { Controller, Get, Param, Query, Body, Post } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
import type { ChatCompletionRequestMessage } from 'openai';
import { EditService } from 'src/edit/edit.service';
import Generator from '../generator/ast';
import lowdb from '../utils/lowdb';
import globalConfig from '../globalConfig';

@Controller('chatgpt')
export class ChatgptController {
  constructor(
    private readonly chatgptService: ChatgptService,
    private readonly editService: EditService,
  ) {}

  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }

  @Get('connect')
  connect(@Query('appKey') appKey) {
    const res = this.chatgptService.connect();
    if (res) {
      return {
        status: 1,
        data: {
          message: '连接成功',
        },
      };
    }
    return {
      status: 0,
      data: {
        message: '连接失败',
      },
    };
  }
  @Post('generate')
  async generate(
    @Body()
    data: {
      message: ChatCompletionRequestMessage;
      codeOperateType: string;
      path: string;
      promptId: string;
    },
  ) {
    if (!this.chatgptService.rootDir) {
      this.chatgptService.rootDir = this.editService.rootDir;
    }
    const res = await this.chatgptService.generate(data);
    return {
      status: 1,
      data: {
        ...res,
      },
    };
  }

  @Get('getAppKey')
  getAppKey() {
    return this.chatgptService.getAppKey();
  }

  @Get('getPromptList')
  getPromptList() {
    return {
      status: 1,
      data: {
        prompt: this.chatgptService.getPrompt(),
      },
    };
  }

  @Get('getCodePromptList')
  getCodePromptList() {
    return {
      status: 1,
      data: {
        prompt: this.chatgptService.getCodePrompt(),
      },
    };
  }

  @Get('startCodeDocument')
  async startCodeDocument(@Query() query: any) {
    const { promptType, files } = query;
    const filesContent = this.editService.getFilesContent(files);
    const codePrompt = this.chatgptService
      .getCodePrompt()
      .find((item) => item.value == promptType);
    const res = await this.chatgptService.startCodeDocument({
      files: filesContent,
      prompt: codePrompt,
    });
    return {
      status: 1,
      data: {
        // messages: codePrompt.messages.concat(res.message),
        ...res,
      },
    };
  }

  @Post('chainExecute')
  async chainExecute(
    @Body()
    data: any,
  ) {
    const res = await this.chatgptService.chainExecute(data);
    return {
      status: 1,
      data: res,
    };
  }

  @Post('saveflowInfo')
  async saveflowInfo(
    @Body()
    data: any,
  ) {
    const res = await this.chatgptService.saveflowInfo(data);
    console.log('*****', res);
  }

  @Post('saveSystemInfo')
  async saveSystemInfo(
    @Body()
    data: any,
  ) {
    lowdb.set('setting', data).write();
    globalConfig.getInstance().updateSetting(data);
    await this.chatgptService.connect();
    return {
      status: 1,
    };
  }

  @Get('getSystemInfo')
  async getSystemInfo(@Query() query: any) {
    const setting = lowdb.get('setting').value();
    return {
      status: 1,
      data: setting,
    };
  }

  @Get('executeProduceChain')
  async executeProduceChain(@Query() query: any) {
    const { chainId, pagePath } = query;
    console.log(query);
    const res = await this.chatgptService.executeProduceChain(
      chainId,
      pagePath,
    );
    if (chainId) {
      return {
        status: 1,
      };
    } else {
      return {
        status: 0,
      };
    }
  }
}
