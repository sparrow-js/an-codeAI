import { ComponentType } from 'react';
import { obx, computed, autorun, makeObservable, IReactionPublic, IReactionOptions, IReactionDisposer } from '@firefly/auto-editor-core';
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
import { megreAssets, AssetsJson } from '@alilc/lowcode-utils';
import { Project } from '../project';
import { DocumentModel } from '../document';
import { INodeSelector, Component } from '../simulator';
// import { Scroller, IScrollable } from './scroller';
import { Dragon, isDragNodeObject, isDragNodeDataObject, LocateEvent, DragObject } from './dragon';
// import { ActiveTracker } from './active-tracker';
import { Detecting } from './detecting';
// import { DropLocation, LocationData, isLocationChildrenDetail } from './location';
import { OffsetObserver, createOffsetObserver } from './offset-observer';
// import { focusing } from './focusing';
// import { SettingTopEntry } from './setting';
// import { BemToolsManager } from '../builtin-simulator/bem-tools/manager';

export enum TransformStage {
    Render = 'render',
    Serilize = 'serilize',
    Save = 'save',
    Clone = 'clone',
    Init = 'init',
    Upgrade = 'upgrade',
  }

export interface DesignerProps {
  editor: IEditor;
  className?: string;
  style?: object;
  defaultSchema?: ProjectSchema;
  hotkeys?: object;
  simulatorProps?: object | ((document: DocumentModel) => object);
  simulatorComponent?: ComponentType<any>;
  dragGhostComponent?: ComponentType<any>;
  suspensed?: boolean;
  componentMetadatas?: ComponentMetadata[];
  globalComponentActions?: ComponentAction[];
  onMount?: (designer: Designer) => void;
  onDragstart?: (e: any) => void;
  onDrag?: (e: any) => void;
  onDragend?: (e: { dragObject: any; copy: boolean }, loc?: any) => void;
  [key: string]: any;
}

export class Designer {
  readonly dragon = new Dragon(this);

  readonly detecting = new Detecting();

  readonly project: Project;

  readonly editor: IEditor;

  get currentDocument() {
    return this.project.currentDocument;
  }

  get currentHistory() {
    return this.currentDocument?.history;
  }

  get currentSelection() {
    return this.currentDocument?.selection;
  }

  constructor(props: DesignerProps) {
    makeObservable(this);
    const { editor } = props;
    this.editor = editor;
    this.setProps(props);

    this.project = new Project(this, props.defaultSchema);

    let startTime: any;
    let src = '';

    let historyDispose: undefined | (() => void);
    const setupHistory = () => {
      if (historyDispose) {
        historyDispose();
        historyDispose = undefined;
      }
    };
    this.project.onCurrentDocumentChange(() => {
      this.postEvent('current-document.change', this.currentDocument);
      this.postEvent('selection.change', this.currentSelection);
      this.postEvent('history.change', this.currentHistory);
       setupHistory();
    });
    this.postEvent('init', this);
     setupHistory();
}

  setupSelection = () => {
    let selectionDispose: undefined | (() => void);
    if (selectionDispose) {
      selectionDispose();
      selectionDispose = undefined;
    }
  };

  postEvent(event: string, ...args: any[]) {
    this.editor.emit(`designer.${event}`, ...args);
  }

  private props?: DesignerProps;

  setProps(nextProps: DesignerProps) {
    const props = this.props ? { ...this.props, ...nextProps } : nextProps;
    if (this.props) {
      // check hotkeys
      // TODO:
      // check simulatorConfig
      if (props.simulatorComponent !== this.props.simulatorComponent) {
        this._simulatorComponent = props.simulatorComponent;
      }
      if (props.simulatorProps !== this.props.simulatorProps) {
        this._simulatorProps = props.simulatorProps;
      }
      if (props.suspensed !== this.props.suspensed && props.suspensed != null) {
        this.suspensed = props.suspensed;
      }
    } else {
      // init hotkeys
      // todo:
      // init simulatorConfig
      if (props.simulatorComponent) {
        this._simulatorComponent = props.simulatorComponent;
      }
      if (props.simulatorProps) {
        this._simulatorProps = props.simulatorProps;
      }
      // init suspensed
      if (props.suspensed != null) {
        this.suspensed = props.suspensed;
      }
    }
    this.props = props;
  }

  async loadIncrementalAssets(incrementalAssets: AssetsJson): Promise<void> {
    console.log('*');
  }

  get(key: string): any {
    return this.props ? this.props[key] : null;
  }

  @obx.ref private _simulatorComponent?: ComponentType<any>;

  @computed get simulatorComponent(): ComponentType<any> | undefined {
    return this._simulatorComponent;
  }

  @obx.ref private _simulatorProps?: object | ((document: DocumentModel) => object);

  @computed get simulatorProps(): object | ((project: Project) => object) {
    return this._simulatorProps || {};
  }

  @obx.ref private _suspensed = false;

  get suspensed(): boolean {
    return this._suspensed;
  }

  set suspensed(flag: boolean) {
    this._suspensed = flag;
    // Todo afterwards...
    if (flag) {
      // this.project.suspensed = true?
    }
  }
  getGlobalComponentActions(): ComponentAction[] | null {
    return this.props?.globalComponentActions || null;
  }

  private oobxList: OffsetObserver[] = [];

  createOffsetObserver(nodeInstance: INodeSelector): OffsetObserver | null {
    const oobx = createOffsetObserver(nodeInstance);
    this.clearOobxList();
    if (oobx) {
      this.oobxList.push(oobx);
    }
    return oobx;
  }

  private clearOobxList(force?: boolean) {
    let l = this.oobxList.length;
    if (l > 20 || force) {
      while (l-- > 0) {
        if (this.oobxList[l].isPurged()) {
          this.oobxList.splice(l, 1);
        }
      }
    }
  }

  @computed get componentsMap(): { [key: string]: NpmInfo | Component } {
    const maps: any = {};
    const designer = this;
    return maps;
  }

  private propsReducers = new Map<TransformStage, PropsReducer[]>();

  transformProps(props: CompositeObject | PropsList, node: Node, stage: TransformStage) {
    if (Array.isArray(props)) {
      // current not support, make this future
      return props;
    }
  }

  addPropsReducer(reducer: PropsReducer, stage: TransformStage) {
    const reducers = this.propsReducers.get(stage);
    if (reducers) {
      reducers.push(reducer);
    } else {
      this.propsReducers.set(stage, [reducer]);
    }
  }

  // eslint-disable-next-line max-len
  autorun(effect: (reaction: IReactionPublic) => void, options?: IReactionOptions): IReactionDisposer {
    return autorun(effect, options);
  }

  purge() {
    // TODO:
  }
}

export type PropsReducerContext = { stage: TransformStage };
export type PropsReducer = (
  props: CompositeObject,
  node: Node,
  ctx?: PropsReducerContext,
) => CompositeObject;
