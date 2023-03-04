import { obx, makeObservable } from '@firefly/auto-editor-core';
import { Designer } from './designer';

export enum DragObjectType {
    // eslint-disable-next-line no-shadow
    Node = 'node',
    NodeData = 'nodedata',
}
export interface DragNodeObject {
    type: DragObjectType.Node;
    nodes: Node[];
}
export interface DragNodeDataObject {
    type: DragObjectType.NodeData;
    data: any | any[];
    thumbnail?: string;
    description?: string;
    [extra: string]: any;
}

export interface DragAnyObject {
    type: string;
    [key: string]: any;
}

export function isDragNodeObject(obj: any): obj is DragNodeObject {
    return obj && obj.type === DragObjectType.Node;
}

export function isDragNodeDataObject(obj: any): obj is DragNodeDataObject {
    return obj && obj.type === DragObjectType.NodeData;
}
/**
 * Drag-on 拖拽引擎
 */
 export class Dragon {
    constructor(readonly designer: Designer) {
        makeObservable(this);
    }
 }