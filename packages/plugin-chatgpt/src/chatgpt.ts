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
    action,
} from '@firefly/auto-editor-core';
import {
    getPromptList,
    watchProject,
    getProjectRootPath,
    getWatchChangeFiles,
    getCodePromptList,
    startCodeDocument,
    chatgptGenerate,
} from '../api';
import { ChatCompletionRequestMessage, Role, OperateType } from '../types';

  export class Chatgpt {
    @obx.ref selection: string;
    @obx.ref promptList: any[];
    @obx.ref currentPrompt: any = 'react';
    @obx.ref chatgptKey: string;
    @obx messages: ChatCompletionRequestMessage[] = [];
    hasConnect: boolean = false;
    projectRootDir: string = '';
    @obx changeFiles: Array<{
      value: string;
      label: string;
    }> = [];
    @obx selectedFiles: string[] = [];
    hasWatchFile: boolean = false;
    operateType: OperateType;
    promptCodeList: any[];
    codeOperateType: string;
    codeOperateList: Array<{
      label: string;
      value: string;
    }> = [
      {
        label: '创建',
        value: 'create',
      },
      {
        label: '修改',
        value: 'modify',
      },
      {
        label: '默认',
        value: 'default',
      },
    ];


    constructor() {
        makeObservable(this);
        this.getPromptList();
        this.getCodePromptList();
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
        const prompt = this.promptList.find(item => item.value === 'react');
        this.messages = prompt.messages;
      }
    }

    private async getCodePromptList() {
      const res = await getCodePromptList();
      if (res.data) {
        this.promptCodeList = res.data.prompt;
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
      }
    }

    setCodePrompt(value: string) {
      this.codeOperateType = value;
    }

    async startPrompt() {
      this.messages = [];
      const res = await startCodeDocument({
        files: this.selectedFiles,
        promptType: this.operateType,
      });
      if (res.data) {
        this.messages = res.data.messages;
      }
      console.log('*****1', res);
    }

    async watchProject(path: string) {
      const res = await watchProject({
        dir: path,
      });
      if (res.data) {
        this.hasWatchFile = true;
      }
    }

    async getWatchChangeFiles() {
      const res = await getWatchChangeFiles();
      if (res.data) {
        this.changeFiles = res.data.files.map((item: string) => {
          return {
            value: item,
            label: item,
          };
        });
      }
      console.log('****', this.changeFiles);
    }

    @action
    setSelectedFiles(files: string[]) {
      this.selectedFiles = files;
    }

    @action
    setOperateType(operateType: OperateType) {
      this.operateType = operateType;
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

    async chatgptGenerate(sendMessage: string) {
      const { messages, codeOperateType } = this;
      if (!sendMessage) return;
      const message = {
        role: Role.user,
        content: sendMessage,
      };
      messages.push(message);
      const res = await chatgptGenerate({
        messages,
        codeOperateType,
      });
      const { data } = res;
      if (data && data.message) {
        messages.push(data.message);
        return true;
      }
      return false;
    }
  }