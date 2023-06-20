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

export interface BlockChainInput<T extends string | object = string>
  extends ChainInputs {
  /** Prompt object to use */
  prompt?: BasePromptTemplate;
  /** LLM Wrapper to use */
  llm: BaseLanguageModel;
  /** vectorStore */
  vectorStore: VectorStore;
  /** OutputParser to use */
  outputParser?: BaseOutputParser<T>;
  /** Key to use for output, defaults to `text` */
  outputKey?: string;

  inputKey?: string;
}
export default class BlockChain<T extends string | object = string>
  extends BaseChain
  implements BlockChainInput<T>
{
  lc_serializable = true;

  prompt: BasePromptTemplate;

  vectorStore: VectorStore;

  llm: BaseLanguageModel;

  outputKey = 'output';

  inputKey = 'question';

  outputParser?: BaseOutputParser<T>;

  constructor(fields: BlockChainInput<T>) {
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
      SystemMessagePromptTemplate.fromTemplate(''),
      new MessagesPlaceholder('placeholder'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);

    // const promptValue = await chatPrompt.formatPromptValue({
    //   input:
    // });
    // const { generations } = await this.llm.generatePrompt(
    //   [promptValue],
    //   valuesForLLM,
    //   runManager?.getChild(),
    // );
    return { [this.outputKey]: 'block_chain' };
  }

  _chainType(): string {
    return 'block_chain' as const;
  }

  get inputKeys() {
    return [this.inputKey];
  }

  get outputKeys() {
    return [this.outputKey];
  }
}
