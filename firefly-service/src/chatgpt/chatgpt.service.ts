import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import type { ChatCompletionRequestMessage } from 'openai';
import { react, command, codeReview, node, refactor } from './prompt';
import FsHandler from '../generator/fshandler';
import Generator from '../generator/ast';
import * as pathInstance from 'path';

@Injectable()
export class ChatgptService {
  openai: any;
  configuration: any;
  apiKey: string;
  rootDir: string;
  messageMap = new Map();
  connect(id: string): boolean {
    this.apiKey = id;
    this.configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY || id,
    });
    this.openai = new OpenAIApi(this.configuration);
    return true;
  }

  async generate(data: {
    message: ChatCompletionRequestMessage;
    codeOperateType?: string;
    path: string;
    promptId: string;
  }) {
    const { configuration, openai } = this;
    const { message, codeOperateType, path, promptId } = data;
    if (!this.apiKey) {
      return {
        error: 'not api key',
      };
    }

    const res = await this.checkPromptType(`
将文本分类为：创建，修改，未知
文本：${message.content}
    `);
    const typeText = res.data.choices[0].text;
    //[ { text: '\n创建', index: 0, logprobs: null, finish_reason: 'stop' } ]

    if (!this.messageMap.has(promptId)) {
      const promptList = this.getPrompt();
      const prompt = promptList.find((item) => item.value === promptId);
      const messageList = prompt.messages.map((item) => {
        return { role: item.role, content: item.content };
      });
      this.messageMap.set(promptId, messageList);
    }

    const messageList = this.messageMap.get(promptId);
    messageList.push(message);

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: 0,
      messages: messageList,
    });
    if (response.data.choices.length) {
      const firstMessage = response.data.choices[0].message;
      messageList.push(firstMessage);
      if (typeText.includes('创建')) {
        console.log('*****2');
        const { content } = firstMessage;
        const fileName = FsHandler.getInstance().extractFileName(content);
        const filePath = `src/pages/${fileName}/index.tsx`;
        FsHandler.getInstance().createFile(
          pathInstance.join(this.rootDir, filePath),
          content,
        );

        const routerPath = pathInstance.join(
          this.rootDir,
          'src/routes/index.tsx',
        );

        const routerContent = Generator.getInstance().appendRouter(
          FsHandler.getInstance().parseFile(routerPath),
          `var data = {
            path: '/${fileName}',
            element: <${fileName} />,
          }`,
          `import ${fileName} from '../pages/${fileName}';`,
        );

        FsHandler.getInstance().writeFile(routerPath, routerContent, true);
        return {
          message: {
            role: 'assistant',
            content: `
创建完成
文件路径：${filePath}
          `,
          },
          url: `/${fileName}`,
          path: pathInstance.join(this.rootDir, filePath),
        };
      } else if (typeText.includes('修改')) {
        FsHandler.getInstance().writeFile(path, firstMessage.content, true);
        return {
          message: {
            role: 'assistant',
            content: `修改完成`,
          },
        };
      }
      if (firstMessage) {
        return {
          message: firstMessage,
        };
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
    return res;
  }

  async checkPromptType(text: string) {
    /**
     * 将文本分类为：创建，修改，未知
        文本：创建产品名称，产品详情。
    */
    const res = await this.openai.createCompletion({
      model: 'text-davinci-003',
      prompt: text,
      max_tokens: 300,
      temperature: 0,
    });
    return res;
  }
}
