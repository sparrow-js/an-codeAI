
import { obx, computed, autorun, makeObservable, runInAction, action } from '@firefly/auto-editor-core';
import { DocumentModel } from '../document-model';

export interface NodeSchema {
    id?: string;
    componentName: string;
    instance: any;
    props?: any;
}


export class Node<Schema extends NodeSchema = NodeSchema> {
    readonly id: string;
    readonly componentName: string;
    readonly instance: any;


    constructor(readonly document: DocumentModel, nodeSchema: Schema) {
        // makeObservable(this);
        const { id, componentName, instance } = nodeSchema;
        this.id = id || '';
        this.componentName = componentName;
        this.instance = instance;
    }
}