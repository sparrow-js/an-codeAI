import { Controller, Get, Param, Query, Body } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
import type { ChatCompletionRequestMessage } from 'openai';

@Controller('chatgpt')
export class ChatgptController {
  constructor(private readonly chatgptService: ChatgptService) {}

  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
  @Get('connect')
  connect(@Query('appKey') appKey) {
    console.log('******', appKey);
    const res = this.chatgptService.connect(appKey);
    return res;
  }
  @Get('generate')
  async generate(@Body() message: ChatCompletionRequestMessage) {
    const res = await this.chatgptService.generate([message]);
    return res;
  }

  @Get('getAppKey')
  getAppKey() {
    return this.chatgptService.getAppKey();
  }
}
