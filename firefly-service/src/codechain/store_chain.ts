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

export interface StoreChainInput<T extends string | object = string>
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
export default class StoreChain<T extends string | object = string>
  extends BaseChain
  implements StoreChainInput<T>
{
  lc_serializable = true;

  prompt: BasePromptTemplate;

  vectorStore: VectorStore;

  llm: BaseLanguageModel;

  inputKey = 'question';

  outputKey = 'storeOutput';

  similarityText = '将代码的变量使用recoil存储: {code}';

  outputParser?: BaseOutputParser<T>;

  debug?: boolean;
  param?: any;

  useInjectPrompt = false;

  constructor(fields: StoreChainInput<T>) {
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
      SystemMessagePromptTemplate.fromTemplate(
        GlobalConfig.getInstance().systemMessage,
      ),
      new MessagesPlaceholder('placeholder'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);

    const formatInput = await this.formatTemplate(this.similarityText, {
      ...this.param,
      code: values[this.inputKey],
    });

    // metadata

    const messages = await this.getPrevPrompt(this.similarityText);

    const promptValue = await chatPrompt.formatPromptValue({
      placeholder: messages,
      input: formatInput,
    });

    const { generations } = await this.llm.generatePrompt(
      [promptValue],
      valuesForLLM,
      runManager?.getChild(),
    );
    return { [this.outputKey]: generations[0][0].text };
  }
  _chainType(): string {
    return 'store_chain' as const;
  }

  get inputKeys() {
    return [this.inputKey];
  }

  get outputKeys() {
    return [this.outputKey];
  }

  async formatTemplate(template: string, param: any) {
    const promptTemplate = PromptTemplate.fromTemplate(template);
    const formatInput = await promptTemplate.format(param);
    return formatInput;
  }

  async getPrevPrompt(text: string) {
    if (this.useInjectPrompt) {
      return [
        new HumanChatMessage(this.param.answer.question),
        new AIChatMessage(this.param.answer.output),
      ];
    } else {
      const documents = await this.vectorStore.similaritySearch(text, 1);
      return documents.reduce((prevValue, item) => {
        prevValue.push(new HumanChatMessage(item.pageContent));
        if (item.metadata && item.metadata.output) {
          prevValue.push(new AIChatMessage(item.metadata.output));
        }
        return prevValue;
      }, []);
    }
  }

  debugger(isDebug: boolean, param: any) {
    this.debug = isDebug;
    this.param = param;
  }

  injectPrompt(param: any) {
    this.useInjectPrompt = true;
    this.param = param;
  }

  clearInjectPrompt() {
    this.useInjectPrompt = false;
  }
}
