
import { obx, computed, autorun, makeObservable, runInAction, action } from '@firefly/auto-editor-core';

export interface NodeSchema {
    id?: string;
    componentName: string;
    props?: any;
}


export class Node<Schema extends NodeSchema = NodeSchema> {
    readonly id: string;
    readonly componentName: string;


    constructor(nodeSchema: Schema) {
        // makeObservable(this);
        const { id, componentName } = nodeSchema;
        this.id = id || '';
        this.componentName = componentName;
        console.log('1');
    }
}