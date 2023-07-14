import { BaseChain, ChainInputs } from 'langchain/chains';
import {
  BasePromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} from 'langchain/prompts';
import {
  HumanChatMessage,
  SystemChatMessage,
  AIChatMessage,
  BaseChatMessage,
} from 'langchain/schema';
import { CallbackManagerForChainRun } from 'langchain/dist/callbacks';
import { ChainValues } from 'langchain/schema';
import { BaseLanguageModel } from 'langchain/base_language';
import { BaseOutputParser } from 'langchain/schema/output_parser';
import { VectorStore } from 'langchain/vectorstores';

export interface APIChainInput<T extends string | object = string>
  extends ChainInputs {
  /** Prompt object to use */
  prompt?: BasePromptTemplate;
  /** LLM Wrapper to use */
  llm: BaseLanguageModel;
  /** vectorStore */
  vectorStore: VectorStore;
  /** OutputParser to use */
  outputParser?: BaseOutputParser<T>;
  inputKey?: string;
  /** Key to use for output, defaults to `text` */
  outputKey?: string;
  similarityText?: string;
}
export default class APIChain<T extends string | object = string>
  extends BaseChain
  implements APIChainInput<T>
{
  lc_serializable = true;

  prompt: BasePromptTemplate;

  vectorStore: VectorStore;

  llm: BaseLanguageModel;

  inputKey = 'question';

  outputKey = 'output';

  similarityText = '分析以下代码创建所需要的请求接口';

  outputParser?: BaseOutputParser<T>;

  constructor(fields: APIChainInput<T>) {
    super(fields);
    this.prompt = fields.prompt;
    this.llm = fields.llm;
    this.vectorStore = fields.vectorStore;
    this.outputKey = fields.outputKey ?? this.outputKey;
    this.inputKey = fields.inputKey ?? this.inputKey;
    this.similarityText = fields.similarityText ?? this.similarityText;
    this.outputParser = fields.outputParser ?? this.outputParser;
  }
  async _call(
    values: ChainValues,
    runManager?: CallbackManagerForChainRun,
  ): Promise<ChainValues> {
    const valuesForPrompt = { ...values };
    const valuesForLLM: this['llm']['CallOptions'] = {};
    for (const key of this.llm.callKeys) {
      if (key in values) {
        valuesForLLM[key as keyof this['llm']['CallOptions']] = values[key];
        delete valuesForPrompt[key];
      }
    }

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(`
你是一个react工程师，使用antd作为UI库。使用recoil库作为状态管理。
1.返回结果只需输出代码，不需要文字解释。
2.开发语言使用typescript。
      `),
      new MessagesPlaceholder('placeholder'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);
    // values[this.inputKey]
    const messages = await this.getPrevPrompt(this.similarityText);
    const promptValue = await chatPrompt.formatPromptValue({
      placeholder: messages,
      input: `${this.similarityText}: ${values[this.inputKey]}`,
    });

    const { generations } = await this.llm.generatePrompt(
      [promptValue],
      valuesForLLM,
      runManager?.getChild(),
    );

    const inputValue = values[this.inputKey];

    const apiCodeContent = generations[0][0].text;

    const similarityText = '分析以下代码将接口{api}使用到下面代码当中:{code}';

    const apiMessages = await this.getPrevPrompt(similarityText);

    console.log('********09', apiMessages);

    const promptTemplate = PromptTemplate.fromTemplate(similarityText);
    const formatApiInput = await promptTemplate.format({
      api: apiCodeContent,
      code: inputValue,
    });

    console.log('********', formatApiInput);

    const apiPromptValue = await chatPrompt.formatPromptValue({
      placeholder: apiMessages,
      input: formatApiInput,
    });

    const { generations: apiGenerations } = await this.llm.generatePrompt(
      [apiPromptValue],
      valuesForLLM,
      runManager?.getChild(),
    );

    return { [this.outputKey]: apiGenerations[0][0].text };
  }

  _chainType(): string {
    return 'api_chain' as const;
  }

  get inputKeys() {
    return [this.inputKey];
  }

  get outputKeys() {
    return [this.outputKey];
  }

  async getPrevPrompt(text: string) {
    const documents = await this.vectorStore.similaritySearch(text, 1);

    console.log('*********13', documents);

    const chatPromiseArr = documents.reduce((prevValue, item) => {
      const promise = new Promise(async (resolve, reject) => {
        const chatMessages = [];
        if (item.metadata && item.metadata.question) {
          chatMessages.push(new HumanChatMessage(item.metadata.question));
        } else {
          const message = await HumanMessagePromptTemplate.fromTemplate(
            item.pageContent,
          ).format({
            ...item.metadata,
          });
          chatMessages.push(message);
        }
        if (item.metadata && item.metadata.output) {
          chatMessages.push(new AIChatMessage(item.metadata.output));
        }
        if (chatMessages.length) {
          resolve(chatMessages);
        }
      });
      prevValue.push(promise);
      return prevValue;
    }, []);
    const chatArr = await Promise.all(chatPromiseArr);
    console.log('********123', chatArr);
    return chatArr.reduce((prevValue, item) => {
      return prevValue.concat(item);
    }, []);
  }
}
