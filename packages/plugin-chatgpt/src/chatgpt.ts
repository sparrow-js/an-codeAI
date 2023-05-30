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
  export class Chatgpt {
    @obx.ref selection: string;

    constructor() {
        makeObservable(this);
    }
  }