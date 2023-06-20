import { SequentialChain, LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  HumanChatMessage,
  SystemChatMessage,
  AIChatMessage,
  BaseChatMessage,
} from 'langchain/schema';
import { Chroma } from 'langchain/vectorstores/chroma';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} from 'langchain/prompts';
import { VetorStoresService } from '../vetorstores/vetorstores.service';
import globalConfig from '../globalConfig';
import PageChain from './page_chain';
import BlockChain from './block_chain';
import StoreChain from './store_chain';
import APIChain from './api_chain';

export default class CodeChain {
  chat: ChatOpenAI;
  systemMessage = `
你是一个react工程师，使用antd作为UI库。使用recoil库作为状态管理。
1.返回结果只需输出代码，不需要文字解释。
2.开发语言使用typescript。
  `;

  chain: SequentialChain;

  constructor(readonly vetorStoresService: VetorStoresService) {
    // this.initTest();
  }

  async initTest() {
    console.log('CodeChain');
    await this.vetorStoresService.connectVectorStore('antd-test9-collection');
    // this.vetorStoresService.getSimilaritySearch(
    //   '分析以下代码将接口{api}使用到下面代码当中:{code}',
    // );
    this.executeTest('创建用户详情，包括用户名称，用户详情');
  }

  async getPrevPrompt(text: string) {
    const documents = await this.vetorStoresService.getSimilaritySearch(text);
    return documents.reduce((prevValue, item) => {
      prevValue.push(new HumanChatMessage(item.pageContent));
      if (item.metadata && item.metadata.code) {
        prevValue.push(new AIChatMessage(item.metadata.code));
      }
      return prevValue;
    }, []);
  }

  pageNode() {
    return this.LLMChain('pageNode', 'pageContent');
  }

  storeNode() {
    const text = '将{pageContent}代码的变量使用recoil存储';
    const chat = new ChatOpenAI(
      {
        temperature: 0,
        openAIApiKey: globalConfig.getInstance().appkey,
      },
      {
        basePath: 'https://chtgptproxyapi-wht.pages.dev/api/v1',
      },
    );
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(this.systemMessage),
      HumanMessagePromptTemplate.fromTemplate(text || '{input}'),
    ]);
    chatPrompt.inputVariables = ['pageContent'];
    return new LLMChain({
      prompt: chatPrompt,
      llm: chat,
      outputKey: 'storeContent',
    });
  }

  LLMChain(messagesPlaceholderKey: string, outputKey: string, text?: string) {
    const chat = new ChatOpenAI(
      {
        temperature: 0,
        openAIApiKey: globalConfig.getInstance().appkey,
      },
      {
        basePath: 'https://chtgptproxyapi-wht.pages.dev/api/v1',
      },
    );
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(this.systemMessage),
      new MessagesPlaceholder(messagesPlaceholderKey),
      HumanMessagePromptTemplate.fromTemplate(text || '{input}'),
    ]);
    return new LLMChain({
      prompt: chatPrompt,
      llm: chat,
      outputKey,
    });
  }

  sequentialLoad() {
    // PageChain
    return new SequentialChain({
      chains: [this.pageChain()],
      inputVariables: ['input', 'pageNode'],
      // Here we return multiple variables
      outputVariables: ['pageContent', 'storeContent'],
      verbose: true,
    });
    // return new SequentialChain({
    //   chains: [this.pageNode(), this.storeNode()],
    //   inputVariables: ['input', 'pageNode'],
    //   // Here we return multiple variables
    //   outputVariables: ['pageContent', 'storeContent'],
    //   verbose: true,
    // });
  }

  async execute(text: string) {
    const overallChain = this.sequentialLoad();
    const pageNode = await this.getPrevPrompt(text);
    const storeNode = await this.getPrevPrompt('将代码的变量使用recoil存储');
    console.log('****3', storeNode);
    const chainExecutionResult = await overallChain.call({
      input: text,
      pageNode,
    });
    console.log('*****9', chainExecutionResult);
    return chainExecutionResult;
  }

  pageChain() {
    const chat = new ChatOpenAI(
      {
        temperature: 0,
        openAIApiKey: globalConfig.getInstance().appkey,
      },
      {
        basePath: 'https://chtgptproxyapi-wht.pages.dev/api/v1',
      },
    );
    return new PageChain({
      vectorStore: this.vetorStoresService.vectorStore,
      llm: chat,
      outputKey: 'pageChainText',
    });
  }

  blockChain() {
    const chat = new ChatOpenAI(
      {
        temperature: 0,
        openAIApiKey: globalConfig.getInstance().appkey,
      },
      {
        basePath: 'https://chtgptproxyapi-wht.pages.dev/api/v1',
      },
    );
    return new BlockChain({
      vectorStore: this.vetorStoresService.vectorStore,
      llm: chat,
      inputKey: 'pageChainText',
      //   outputKey: 'pageChainText',
    });
  }

  storeChain() {
    const chat = new ChatOpenAI(
      {
        temperature: 0,
        openAIApiKey: globalConfig.getInstance().appkey,
      },
      {
        basePath: 'https://chtgptproxyapi-wht.pages.dev/api/v1',
      },
    );
    return new StoreChain({
      vectorStore: this.vetorStoresService.vectorStore,
      llm: chat,
      inputKey: 'pageChainText',
      outputKey: 'storeChainText',
    });
  }

  apiChain() {
    // APIChain
    const chat = new ChatOpenAI(
      {
        temperature: 0,
        openAIApiKey: globalConfig.getInstance().appkey,
      },
      {
        basePath: 'https://chtgptproxyapi-wht.pages.dev/api/v1',
      },
    );
    return new APIChain({
      vectorStore: this.vetorStoresService.vectorStore,
      llm: chat,
      inputKey: 'storeChainText',
      outputKey: 'apiChainText',
    });
  }

  async executeTest(text: string) {
    if (!this.chain) {
      this.chain = new SequentialChain({
        chains: [this.pageChain(), this.storeChain(), this.apiChain()],
        inputVariables: ['question'],
        // Here we return multiple variables
        outputVariables: ['pageChainText', 'storeChainText', 'apiChainText'],
        verbose: true,
      });
    }
    const res = await this.chain.call({
      question: text,
    });
    console.log('*******80', res);
  }
}
