import { Controller, Get, Param } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';

@Controller('chatgpt')
export class ChatgptController {
  constructor(private readonly chatgptService: ChatgptService) {}

  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
  @Get('connect')
  connect() {
    const res = this.chatgptService.connect();
    return res;
  }
  @Get('generate')
  async generate() {
    const res = await this.chatgptService.generate();
    return res;
  }
}
