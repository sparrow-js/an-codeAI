import { ComponentType } from 'react';
import { Project } from '../project';
import { obx, computed, autorun, makeObservable, IReactionPublic, IReactionOptions, IReactionDisposer } from '@firefly/auto-editor-core';
import { DocumentModel } from '../document';

import {
    ProjectSchema,
    ComponentMetadata,
    ComponentAction,
    NpmInfo,
    IEditor,
    CompositeObject,
    PropsList,
    isNodeSchema,
    NodeSchema,
  } from '@alilc/lowcode-types';
export interface DesignerProps {
    className?: string;
    style?: object;
    hotkeys?: object;
    onMount?: (designer: Designer) => void;
    [key: string]: any;
}

export class Designer {
    readonly project: Project;
    simulatorComponent?: ComponentType<any>;
    readonly editor: IEditor;

    @obx.ref private _simulatorProps?: object | ((document: DocumentModel) => object);

    @computed get simulatorProps(): object | ((project: Project) => object) {
      return this._simulatorProps || {};
    }

    constructor(props: any) {
        makeObservable(this);
        const { editor } = props;
        this.editor = editor;
        this.project = new Project(this, props.defaultSchema);
    }

    setProps(nextProps: DesignerProps) {}

    postEvent(event: string, ...args: any[]) {}

    purge() {}

}

