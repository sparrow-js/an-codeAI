import { Controller, Get, Param, Query, Body, Post } from '@nestjs/common';
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
    const res = this.chatgptService.connect(appKey);
    return res;
  }
  @Post('generate')
  async generate(@Body() message: ChatCompletionRequestMessage) {
    console.log('******', message);
    // const res = await this.chatgptService.generate([message]);
    // return res;
    return {
      status: 1,
      data: {
        message:
          "以下是一个简单的React组件示例：\n\n```jsx\nimport React, { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  function handleClick() {\n    setCount(count + 1);\n  }\n\n  return (\n    <div>\n      <h1>Counter: {count}</h1>\n      <button onClick={handleClick}>Increment</button>\n    </div>\n  );\n}\n\nexport default Counter;\n```\n\n这个组件包含一个计数器和一个按钮，每次点击按钮时计数器会加1。useState hook用于在函数组件中添加状态。handleClick函数会更新计数器的状态。最后，组件通过JSX语法返回一个包含计数器和按钮的div元素。",
      },
    };
  }

  @Get('getAppKey')
  getAppKey() {
    return this.chatgptService.getAppKey();
  }
}
