import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import type { ChatCompletionRequestMessage } from 'openai';
import { react, command, codeReview, node, refactor } from './prompt';
import FsHandler from '../generator/fshandler';
import pathInstance from 'path';

@Injectable()
export class ChatgptService {
  openai: any;
  configuration: any;
  apiKey: string;
  rootDir: string;
  connect(id: string): boolean {
    this.apiKey = id;
    this.configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY || id,
    });
    this.openai = new OpenAIApi(this.configuration);
    return true;
  }

  async generate(data: {
    messages: ChatCompletionRequestMessage[];
    operateType?: string;
    path: string;
  }) {
    const { configuration, openai } = this;
    const { messages, operateType, path } = data;

    if (!configuration.apiKey) {
      return {
        error: 'not api key',
      };
    }

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: 0.6,
      messages,
    });
    if (response.data.choices.length) {
      console.log('****5', response.data.choices);
      const firstMessage = response.data.choices[0].message;
      if (operateType === 'create') {
        const fileName = FsHandler.getInstance().extractFileName(firstMessage);
        const filePath = `src/pages/${fileName}`;
        FsHandler.getInstance().createFile(
          pathInstance.join(this.rootDir, filePath),
          firstMessage,
        );
        return {
          role: 'assistant',
          content: `
创建完成
文件路径：${filePath}
`,
        };
      } else if (operateType === 'modify') {
        FsHandler.getInstance().writeFile(path, firstMessage);
        return {
          role: 'assistant',
          content: `修改完成`,
        };
      }
      if (firstMessage) {
        return firstMessage;
      }
    }
  }

  getAppKey() {
    return {
      status: 1,
      data: {
        appKey: this.apiKey,
      },
    };
  }

  getPrompt() {
    return [react, command];
  }

  getCodePrompt() {
    return [codeReview, node, refactor];
  }

  async startCodeDocument(data: any) {
    const { files, prompt } = data;
    const { messages } = prompt;
    const userPrompt = messages[1];
    const content = files[0].content;
    userPrompt.content = userPrompt.content
      .replace('[code block]', content)
      .replace('[language]', 'tsx or ts');
    const res = await this.generate(messages);
    console.log('*********8', res);
    return res;
  }
}
