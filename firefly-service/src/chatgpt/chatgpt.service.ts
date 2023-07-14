import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import type { ChatCompletionRequestMessage } from 'openai';
import { react, command, node, refactor } from './prompt';
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
import { LLMChain } from 'langchain/chains';
import {
  HumanChatMessage,
  SystemChatMessage,
  AIChatMessage,
} from 'langchain/schema';
import { OpenAI } from 'langchain/llms/openai';
import { VetorStoresService } from '../vetorstores/vetorstores.service';
import globalConfig from '../globalConfig';
import CodeChain from '../codechain';
import { serialNode } from '../codechain/serialNode';

@Injectable()
export class ChatgptService {
  openai: any;
  chatOpenAI: any;
  apiKey: string;
  rootDir: string;
  messageMap = new Map();
  cacheMessageMap = new Map();
  chain: LLMChain;
  globalConfig = globalConfig.getInstance();
  fsHandler = FsHandler.getInstance();
  codeChain: CodeChain;
  currentChainId: string;
  pagePath: string;

  constructor(readonly vetorStoresService: VetorStoresService) {
    this.codeChain = new CodeChain(vetorStoresService);
  }
  connect(): boolean {
    this.apiKey = this.globalConfig.apikey;
    console.log('******', this.apiKey);
    this.chatOpenAI = new ChatOpenAI(
      {
        openAIApiKey: this.apiKey,
        temperature: 0,
      },
      {
        basePath: this.globalConfig.proxyUrl,
      },
    );
    if (this.apiKey) {
      this.vetorStoresService.connectVectorStore('antd-test10011-collection');
      return true;
    } else {
      return true;
    }
  }

  async generate(data: {
    message: ChatCompletionRequestMessage;
    codeOperateType?: string;
    path: string;
    promptId: string;
  }) {
    const { message, path } = data;
    if (!this.apiKey) {
      return {
        error: 'not api key',
      };
    }
    const res = await this.checkPromptType(`
    将文本分类为：创建，修改，未知
    文本：${message.content}
        `);
    const typeText = res;

    if (!this.chain) this.initChat();
    const { response, id } = await this.call(message.content);
    const { text } = response;
    const firstMessage = {
      content: text,
      role: 'assistant',
    };
    if (typeText.includes('创建')) {
      const { content } = firstMessage;
      const fileName = this.fsHandler.extractFileName(content);
      const filePath = `src/pages/${fileName}/index.tsx`;
      this.pagePath = pathInstance.join(this.rootDir, filePath);
      this.currentChainId = id;
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
          content,
        },
        url: `/${fileName}`,
        path: pathInstance.join(this.rootDir, filePath),
        chainId: this.currentChainId,
      };
    } else if (typeText.includes('修改')) {
      FsHandler.getInstance().writeFile(path, firstMessage.content, true);
      return {
        message: firstMessage,
      };
    } else {
      return {
        message: firstMessage,
      };
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
    return [node, refactor];
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
    const model = new OpenAI(
      {
        openAIApiKey: this.apiKey,
        temperature: 0,
        modelName: 'text-davinci-003',
      },
      {
        basePath: this.globalConfig.proxyUrl,
      },
    );
    const res = await model.call(text);
    console.log(res);
    return res;
  }

  async getMessageFormat(content: string, parentId?: string) {
    let docs;
    if (parentId) {
      docs = await this.vetorStoresService.getSimilaritySearchByFilter(
        content,
        {
          parentId,
        },
      );
    } else {
      docs = await this.vetorStoresService.getSimilaritySearch(content);
    }
    const { id } = docs[0].metadata;
    const messages = docs.reduce((prevValue, item) => {
      const { pageContent, metadata } = item;

      if (metadata.question) {
        prevValue.push(new HumanChatMessage(metadata.question));
      } else {
        prevValue.push(new HumanChatMessage(pageContent));
      }

      if (metadata && metadata.answer) {
        prevValue.push(new AIChatMessage(metadata.answer));
      }
      return prevValue;
    }, []);
    return {
      id,
      messages,
    };
  }

  initChat() {
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(this.globalConfig.systemMessage),
      new MessagesPlaceholder('preMessage'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);

    this.chain = new LLMChain({
      prompt: chatPrompt,
      llm: this.chatOpenAI,
      verbose: true,
    });
  }

  async call(content: string) {
    const { messages, id } = await this.getMessageFormat(content);
    const response = await this.chain.call({
      input: content,
      preMessage: messages,
    });
    return {
      response,
      id,
    };
  }

  async chainExecute(node: any) {
    const res = await this.codeChain.executePromptDebug(node);
    return res;
  }

  async saveflowInfo(data: any) {
    return await this.vetorStoresService.addDocument(data);
  }

  async executeProduceChain(id: string, pagePath: string) {
    const res = await this.vetorStoresService.getSimilaritySearchById('', id);
    console.log(res);
    const flow = res[0]?.metadata?.flow[0];
    if (flow) {
      const nodes = serialNode(flow);
      if (nodes.length > 1) {
        return await this.codeChain.executeChain(
          nodes,
          FsHandler.getInstance().readFileSync(pagePath || this.pagePath),
        );
      }
    }
    return null;
  }
}
