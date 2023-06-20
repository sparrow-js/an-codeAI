import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import type { ChatCompletionRequestMessage } from 'openai';
import { react, command, codeReview, node, refactor } from './prompt';
import FsHandler from '../generator/fshandler';
import Generator from '../generator/ast';
import * as pathInstance from 'path';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
  AIMessagePromptTemplate,
} from 'langchain/prompts';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import {
  HumanChatMessage,
  SystemChatMessage,
  AIChatMessage,
} from 'langchain/schema';
import { OpenAI } from 'langchain/llms/openai';
import { VetorStoresService } from '../vetorstores/vetorstores.service';
import globalConfig from '../globalConfig';
import CodeChain from '../codechain';

@Injectable()
export class ChatgptService {
  openai: any;
  chatOpenAI: any;
  apiKey: string;
  rootDir: string;
  messageMap = new Map();
  cacheMessageMap = new Map();
  chain: ConversationChain;
  globalConfig = globalConfig.getInstance();
  codeChain: CodeChain;
  constructor(readonly vetorStoresService: VetorStoresService) {
    this.codeChain = new CodeChain(vetorStoresService);
  }
  connect(id: string): boolean {
    this.apiKey = id;
    this.globalConfig.setAppkey(this.apiKey);
    this.chatOpenAI = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY || id,
      temperature: 0,
    });
    // this.vetorStoresService.createDocsEmbedding();
    this.vetorStoresService.connectVectorStore('antd-test5-collection');
    return true;
  }

  async generate(data: {
    message: ChatCompletionRequestMessage;
    codeOperateType?: string;
    path: string;
    promptId: string;
  }) {
    const { openai } = this;
    const { message, codeOperateType, path, promptId } = data;
    if (!this.apiKey) {
      return {
        error: 'not api key',
      };
    }
    console.log('**********', 12);

    //     const res = await this.checkPromptType(`
    // 将文本分类为：创建，修改，未知
    // 文本：${message.content}
    //     `);
    //     const typeText = res;
    const content = await this.codeChain.execute(message.content);

    // if (!this.chain) this.initChat();

    //     const { response } = await this.call(message.content);
    //     console.log('******8', response);
    //     if (response) {
    //       const firstMessage = {
    //         content: (response as string) || '',
    //         from: 'ai',
    //         role: 'assistant',
    //       };
    //       if (typeText.includes('创建')) {
    //         const { content } = firstMessage;
    //         const fileName = FsHandler.getInstance().extractFileName(content);
    //         const filePath = `src/pages/${fileName}/index.tsx`;
    //         FsHandler.getInstance().createFile(
    //           pathInstance.join(this.rootDir, filePath),
    //           content,
    //         );

    //         const routerPath = pathInstance.join(
    //           this.rootDir,
    //           'src/routes/index.tsx',
    //         );

    //         const routerContent = Generator.getInstance().appendRouter(
    //           FsHandler.getInstance().parseFile(routerPath),
    //           `var data = {
    //             path: '/${fileName}',
    //             element: <${fileName} />,
    //           }`,
    //           `import ${fileName} from '../pages/${fileName}';`,
    //         );

    //         FsHandler.getInstance().writeFile(routerPath, routerContent, true);
    //         return {
    //           message: {
    //             role: 'assistant',
    //             from: 'custom',
    //             content: `
    // 创建完成
    // 文件路径：${filePath}
    //           `,
    //           },
    //           url: `/${fileName}`,
    //           path: pathInstance.join(this.rootDir, filePath),
    //         };
    //       } else if (typeText.includes('修改')) {
    //         FsHandler.getInstance().writeFile(path, firstMessage.content, true);
    //         return {
    //           message: {
    //             role: 'assistant',
    //             content: `修改完成`,
    //             from: 'custom',
    //           },
    //         };
    //       }
    //       if (firstMessage) {
    //         return {
    //           message: firstMessage,
    //         };
    //       }
    //     }
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
    const model = new OpenAI({
      openAIApiKey: this.apiKey,
      temperature: 0,
      modelName: 'text-davinci-003',
    });
    const res = await model.call(text);
    console.log(res);
    return res;
  }

  async initMessage(content: string) {
    const docs = await this.vetorStoresService.getSimilaritySearch(content);

    const messages = docs.reduce((prevValue, item) => {
      const { pageContent, metadata } = item;
      if (pageContent) {
        prevValue.push(new HumanChatMessage(pageContent));
      }

      if (metadata && metadata.code) {
        prevValue.push(new AIChatMessage(metadata.code));
      }
      return prevValue;
    }, []);
    this.cacheMessageMap.set('react', messages);
    return messages;
  }

  initChat() {
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `
        你是一个react工程师，使用antd作为UI库。
        1.返回结果只需输出代码。
        2.开发语言使用typescript。
        `,
      ),
      new MessagesPlaceholder('preMessage'),
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);

    const memory = new BufferMemory({
      inputKey: 'question',
      returnMessages: true,
      memoryKey: 'history',
    });
    this.chain = new ConversationChain({
      memory,
      prompt: chatPrompt,
      llm: this.chatOpenAI,
      verbose: true,
    });
  }

  async call(content: string) {
    const response = await this.chain.call({
      input: content,
      preMessage: this.cacheMessageMap.has('react')
        ? this.cacheMessageMap.get('react')
        : this.initMessage(content),
    });
    return response;
  }
}
