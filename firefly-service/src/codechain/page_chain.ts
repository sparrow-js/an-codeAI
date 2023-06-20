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
import { CallbackManagerForChainRun } from 'langchain/dist/callbacks';
import { ChainValues } from 'langchain/schema';
import { BaseLanguageModel } from 'langchain/base_language';
import { BaseOutputParser } from 'langchain/schema/output_parser';
import { VectorStore } from 'langchain/vectorstores';

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

  constructor(fields: PageChainInput<T>) {
    super(fields);
    this.prompt = fields.prompt;
    this.llm = fields.llm;
    this.vectorStore = fields.vectorStore;
    this.outputKey = fields.outputKey ?? this.outputKey;
    this.inputKey = fields.inputKey ?? this.inputKey;
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

    const messages = await this.getPrevPrompt(values[this.inputKey]);
    const promptValue = await chatPrompt.formatPromptValue({
      placeholder: messages,
      input: values[this.inputKey],
    });

    console.log('******08page', promptValue);

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
