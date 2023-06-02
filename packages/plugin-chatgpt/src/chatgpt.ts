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
import { getPromptList, watchProject, getProjectRootPath } from '../api';
import { ChatCompletionRequestMessage, Role } from '../types';


  export class Chatgpt {
    @obx.ref selection: string;
    @obx.ref promptList: any[];
    @obx.ref currentPrompt: any;
    @obx.ref chatgptKey: string;
    @obx messages: ChatCompletionRequestMessage[] = [];
    hasConnect: boolean = false;
    projectRootDir: string = '';
    @obx changeFiles: string[] = [];

    constructor() {
        makeObservable(this);
        this.getPromptList();
        this.init();
    }
    async init() {
      await this.getProjectRootPath();
      if (this.projectRootDir) {
        this.watchProject(this.projectRootDir);
      }
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
        this.messages = [].concat(this.currentPrompt.messages);
        console.log('******', this.messages);
      }
    }

    async watchProject(path: string) {
      const res = await watchProject({
        dir: path,
      });
      console.log('*********9', res);
    }

    async getProjectRootPath() {
      const Iframe = document.getElementsByClassName('lc-simulator-content-frame')[0] as HTMLIFrameElement;
      const app = Iframe.contentDocument?.querySelector('div[data-locatorjs-id*="/"]');
      if (app) {
        let path = (app as HTMLElement).dataset['locatorjsId'];
        path = path ? path.split('::')[0] : '';
        if (path) {
          const res = await getProjectRootPath({
            path,
          });
          if (res.data) {
            this.projectRootDir = res.data.rootDir;
          }
        }
      }
    }
  }