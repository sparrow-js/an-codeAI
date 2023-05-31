import {
    obx,
    autorun,
    reaction,
    computed,
    engineConfig,
    IReactionPublic,
    IReactionOptions,
    IReactionDisposer,
    makeObservable,
    hotkey,
} from '@firefly/auto-editor-core';
import { getPromptList } from '../api';
import { ChatCompletionRequestMessage, Role } from '../types';


  export class Chatgpt {
    @obx.ref selection: string;
    @obx.ref promptList: any[];
    @obx.ref currentPrompt: any;
    @obx.ref chatgptKey: string;
    @obx.ref messages: ChatCompletionRequestMessage[];
    hasConnect: boolean = false;

    constructor() {
        makeObservable(this);
        this.getPromptList();
    }

    private async getPromptList() {
      const res = await getPromptList();
      if (res.data) {
        this.promptList = res.data.prompt;
      }
    }
    /**
     * @description: 生成对话
     * @param {string} text
     */
    setPrompt(value: string) {
      const prompt = this.promptList.find((item) => item.value === value);
      if (prompt) {
        this.currentPrompt = prompt;
      }
    }
  }