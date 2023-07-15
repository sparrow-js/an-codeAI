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
import FsHandler from '../generator/fshandler';

export default class CodeChain {
  chat: ChatOpenAI;
  chain: SequentialChain;

  page: PageChain;
  store: StoreChain;
  api: APIChain;
  globalConfig = globalConfig.getInstance();
  codeChainMap = new Map();

  constructor(readonly vetorStoresService: VetorStoresService) {
    this.init();
    this.page = this.pageChain();
    this.store = this.storeChain();
    this.api = this.apiChain();
    this.codeChainMap.set('PageChain', this.page);
    this.codeChainMap.set('StoreChain', this.store);
    this.codeChainMap.set('api', this.api);
  }

  async init() {
    console.log('CodeChain');
    await this.vetorStoresService.connectVectorStore(
      'antd-test10001-collection',
    );
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

  LLMChain(messagesPlaceholderKey: string, outputKey: string, text?: string) {
    const chat = new ChatOpenAI(
      {
        temperature: 0,
        openAIApiKey: globalConfig.getInstance().apikey,
      },
      {
        basePath: this.globalConfig.proxyUrl,
      },
    );
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(this.globalConfig.systemMessage),
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
  }

  async execute(text: string) {
    const overallChain = this.sequentialLoad();
    const pageNode = await this.getPrevPrompt(text);
    const chainExecutionResult = await overallChain.call({
      input: text,
      pageNode,
    });
    return chainExecutionResult;
  }

  pageChain() {
    const chat = new ChatOpenAI(
      {
        temperature: 0,
        openAIApiKey: globalConfig.getInstance().apikey,
        maxTokens: 3000,
      },
      {
        basePath: this.globalConfig.proxyUrl,
      },
    );
    const param = {
      vectorStore: this.vetorStoresService.vectorStore,
      llm: chat,
    };

    return new PageChain(param);
  }

  blockChain() {
    const chat = new ChatOpenAI(
      {
        temperature: 0,
        openAIApiKey: globalConfig.getInstance().apikey,
      },
      {
        basePath: this.globalConfig.proxyUrl,
      },
    );
    return new BlockChain({
      vectorStore: this.vetorStoresService.vectorStore,
      llm: chat,
    });
  }

  storeChain() {
    const chat = new ChatOpenAI(
      {
        temperature: 0,
        openAIApiKey: globalConfig.getInstance().apikey,
      },
      {
        basePath: this.globalConfig.proxyUrl,
      },
    );
    return new StoreChain({
      vectorStore: this.vetorStoresService.vectorStore,
      llm: chat,
    });
  }

  apiChain() {
    // APIChain
    const chat = new ChatOpenAI(
      {
        temperature: 0,
        openAIApiKey: globalConfig.getInstance().apikey,
      },
      {
        basePath: this.globalConfig.proxyUrl,
      },
    );
    return new APIChain({
      vectorStore: this.vetorStoresService.vectorStore,
      llm: chat,
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
  }

  async executeChain(nodes: any[], code: string) {
    const chains = nodes.reduce((prev, nodeInfo) => {
      const {
        data: { type, node: nodeData, link },
      } = nodeInfo;
      if (type !== 'PageChain') {
        const chain = this.codeChainMap.get(type);

        const param = this.parseData(nodeData, link);
        chain.injectPrompt(param);
        prev.push(chain);
      }
      return prev;
    }, []);
    if (chains.length > 0) {
      const chain = new SequentialChain({
        chains: chains,
        inputVariables: ['question'],
        verbose: true,
      });

      const res = await chain.call({
        question: code,
      });
      const content = res[Object.keys(res)[0]];
      const codes = FsHandler.getInstance().codeCategorizeParse(content);
      return codes;
    }
    return null;
  }

  parseData(data: any, link?: any) {
    const { template, type } = data;
    const { question, answer } = template;
    let metadata;
    if (answer.type == 'list') {
      metadata = {};
      answer.dataList.forEach((item) => {
        metadata[item.key] = item.value;
      });
    } else {
      metadata = answer.value;
    }
    const chain = [];
    if (link) {
      link.forEach((item) => {
        chain.push(this.parseData(item.data.node));
      });
    }
    const parseData: any = {
      question: question.value,
      answer: metadata,
      type,
    };
    if (chain.length > 0) parseData.chain = chain;
    return parseData;
  }

  async executePromptDebug(data: any) {
    const { value, node } = data;
    const { type, node: nodeData, link } = node;

    const param = this.parseData(nodeData, link);

    switch (type) {
      case 'PageChain':
        this.page.injectPrompt(param);
        const res = await this.page.call({
          question: value,
        });
        return {
          content: res.output,
          type: 'PageChain',
        };
      case 'StoreChain':
        console.log('StoreChain', value);
        this.store.injectPrompt(param);
        const storeCode = await this.store.call({
          question: value,
        });
        return {
          content: storeCode.output,
          type: 'StoreChain',
        };
      case 'ApiChain':
        this.api.injectPrompt(param);
        const apiCode = await this.api.call({
          question: value,
        });
        return {
          content: apiCode.output,
          type: 'ApiChain',
        };
      default:
        break;
    }
  }
}
