import { Node, ParentalNode } from './node';
import { EventEmitter } from 'events';

import { obx, computed, globalContext, makeObservable } from '@firefly/auto-editor-core';

export interface IOnChangeOptions {
    type: string;
    node: Node;
}

export class NodeChildren {
    @obx.shallow private children: Node[];
    private emitter = new EventEmitter();

    constructor(readonly owner: ParentalNode, data: any | any[], options: any = {}) {
        makeObservable(this);
        this.children = (Array.isArray(data) ? data : [data]).map((child) => {
          return this.owner.document.createNode(child, options.checkId);
        });
    }
}