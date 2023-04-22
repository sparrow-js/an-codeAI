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

const SHAKE_DISTANCE = 4;
/**
 * mouse shake check
 */
export function isShaken(e1: MouseEvent | DragEvent, e2: MouseEvent | DragEvent): boolean {
  if ((e1 as any).shaken) {
    return true;
  }
  if (e1.target !== e2.target) {
    return true;
  }
  return (
    Math.pow(e1.clientY - e2.clientY, 2) + Math.pow(e1.clientX - e2.clientX, 2) > SHAKE_DISTANCE
  );
}

/**
 * Drag-on 拖拽引擎
 */
 export class Dragon {
    @obx.ref private _dragging = false;

    @obx.ref private _canDrop = false;

    get dragging(): boolean {
        return this._dragging;
    }

    constructor(readonly designer: Designer) {
        makeObservable(this);
    }
 }