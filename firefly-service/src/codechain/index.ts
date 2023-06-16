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
} from 'langchain/prompts';
import { VetorStoresService } from '../vetorstores/vetorstores.service';

export default class CodeChain {
  chat: ChatOpenAI;
  vetorStoresService: VetorStoresService;
  systemMessage: string;

  constructor() {
    console.log('CodeChain');
  }

  pageNode() {
    return this.LLMChain('pageNode', 'pageContent');
  }

  storeNode() {
    const text = `将{text}代码的变量使用recoil存储`;
    return this.LLMChain('storeNode', 'storeContent', text);
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

  async call(text: string, prevMessages: any[]) {
    const response = await this.chat.call([
      ...prevMessages,
      new HumanChatMessage(text),
    ]);
    console.log(response);
  }
  LLMChain(messagesPlaceholderKey: string, outputKey: string, text?: string) {
    const chat = new ChatOpenAI({ temperature: 0 });
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
    return new SequentialChain({
      chains: [this.pageNode(), this.storeNode()],
      inputVariables: ['input', 'pageNode', 'storeNode'],
      // Here we return multiple variables
      outputVariables: ['pageContent', 'storeContent'],
      verbose: true,
    });
  }

  async execute() {
    const overallChain = this.sequentialLoad();

    const chainExecutionResult = await overallChain.call({
      title: 'Tragedy at sunset on the beach',
      era: 'Victorian England',
    });
    console.log(chainExecutionResult);
  }
}
