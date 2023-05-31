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
  export class Chatgpt {
    @obx.ref selection: string;
    @obx.ref promptList: any[];

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
  }