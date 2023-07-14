import { BaseChain, ChainInputs } from 'langchain/chains';
import {
  BasePromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from 'langchain/prompts';
import {
  HumanChatMessage,
  SystemChatMessage,
  AIChatMessage,
  BaseChatMessage,
} from 'langchain/schema';
import {
  CallbackManagerForChainRun,
  Callbacks,
} from 'langchain/dist/callbacks';
import { ChainValues } from 'langchain/schema';
import { BaseLanguageModel } from 'langchain/base_language';
import { BaseOutputParser } from 'langchain/schema/output_parser';
import { VectorStore } from 'langchain/vectorstores';
import GlobalConfig from 'src/globalConfig';

export interface PageChainInput<T extends string | object = string>
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
  debug?: boolean;
  param?: any;
}
export default class PageChain<T extends string | object = string>
  extends BaseChain
  implements PageChainInput<T>
{
  lc_serializable = true;

  prompt: BasePromptTemplate;

  vectorStore: VectorStore;

  llm: BaseLanguageModel;

  inputKey = 'question';

  outputKey = 'output';

  outputParser?: BaseOutputParser<T>;

  debug?: boolean;

  param?: any;

  useInjectPrompt = false;

  constructor(fields: PageChainInput<T>) {
    super(fields);
    this.prompt = fields.prompt;
    this.llm = fields.llm;
    this.vectorStore = fields.vectorStore;
    this.outputKey = fields.outputKey ?? this.outputKey;
    this.inputKey = fields.inputKey ?? this.inputKey;
    this.debug = fields.debug ?? this.debug;
    this.param = fields.param ?? this.param;

    this.outputParser = fields.outputParser ?? this.outputParser;
  }

  /**
   * Run the core logic of this chain and add to output if desired.
   *
   * Wraps _call and handles memory.
   */
  call(
    values: ChainValues & this['llm']['CallOptions'],
    callbacks?: Callbacks | undefined,
  ): Promise<ChainValues> {
    return super.call(values, callbacks);
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

    const messages = await this.getPrevPrompt(values[this.inputKey]);
    const promptValue = await chatPrompt.formatPromptValue({
      placeholder: messages,
      input: values[this.inputKey],
    });

    const { generations } = await this.llm.generatePrompt(
      [promptValue],
      valuesForLLM,
      runManager?.getChild(),
    );
    return { [this.outputKey]: generations[0][0].text };
  }
  _chainType(): string {
    return 'page_chain' as const;
  }

  get inputKeys() {
    return [this.inputKey];
  }

  get outputKeys() {
    return [this.outputKey];
  }

  async getPrevPrompt(text: string) {
    if (this.useInjectPrompt) {
      return [
        new HumanChatMessage(this.param.question),
        new AIChatMessage(this.param.answer),
      ];
    } else {
      const documents = await this.vectorStore.similaritySearch(text, 2);
      return documents.reduce((prevValue, item) => {
        prevValue.push(new HumanChatMessage(item.pageContent));
        if (item.metadata && item.metadata.output) {
          prevValue.push(new AIChatMessage(item.metadata.output));
        }
        return prevValue;
      }, []);
    }
  }

  injectPrompt(param: any) {
    this.useInjectPrompt = true;
    this.param = param;
  }

  clearInjectPrompt() {
    this.useInjectPrompt = false;
  }
}
