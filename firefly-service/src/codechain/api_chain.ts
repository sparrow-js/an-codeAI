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
import GlobalConfig from 'src/globalConfig';

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
  debug?: boolean;
  param?: any;
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
  param?: any;
  useInjectPrompt = false;

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

    const apiCodeContent = await this.step(values, valuesForLLM, runManager);

    const inputValue = values[this.inputKey];

    const similarityText = this.param.question;

    const formatApiInput = await this.getPromptTemplate(similarityText, {
      ...this.param.answer,
      api: apiCodeContent,
      code: inputValue,
    });

    const apiMessages = await this.getPromptValue(
      values,
      this.param,
      formatApiInput,
      similarityText,
    );

    console.log('************8', apiMessages);

    const { generations: apiGenerations } = await this.llm.generatePrompt(
      [apiMessages],
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

  getChatPromptTemplate() {
    return ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        GlobalConfig.getInstance().systemMessage,
      ),
      new MessagesPlaceholder('placeholder'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);
  }

  async getPromptValue(
    values: any,
    param: any,
    input: string,
    similarityText?: string,
  ) {
    const chatPrompt = this.getChatPromptTemplate();
    const messages = this.useInjectPrompt
      ? await this.getFlowPrompt(param)
      : await this.getSimilarityPrompt(similarityText || this.similarityText);
    return await chatPrompt.formatPromptValue({
      placeholder: messages,
      input,
    });
  }

  async step(values: any, valuesForLLM: any, runManager: any) {
    const { chain } = this.param;
    const content = chain[0];
    const input = await this.getPromptTemplate(content.question, {
      code: values[this.inputKey],
    });
    console.log('*******123', input);

    const promptValue = await this.getPromptValue(
      values,
      this.param.chain[0],
      input,
    );

    const { generations } = await this.llm.generatePrompt(
      [promptValue],
      valuesForLLM,
      runManager?.getChild(),
    );
    const apiCodeContent = generations[0][0].text;
    return apiCodeContent;
  }

  async getFlowPrompt(param: any) {
    return [
      new HumanChatMessage(param.answer.question),
      new AIChatMessage(param.answer.output),
    ];
  }

  async getSimilarityPrompt(text: string) {
    const documents = await this.vectorStore.similaritySearch(text, 1);

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
    return chatArr.reduce((prevValue, item) => {
      return prevValue.concat(item);
    }, []);
  }

  async getPromptTemplate(text: string, param: any) {
    const promptTemplate = PromptTemplate.fromTemplate(text);
    const content = await promptTemplate.format(param);
    return content;
  }

  injectPrompt(param: any) {
    this.useInjectPrompt = true;
    this.param = param;
  }

  clearInjectPrompt() {
    this.useInjectPrompt = false;
  }
}
