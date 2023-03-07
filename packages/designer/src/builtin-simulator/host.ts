
import {
    AssetLevel,
    Asset,
    AssetList,
    assetBundle,
    assetItem,
    AssetType,
    isElement,
    isFormEvent,
    hasOwnProperty,
    UtilsMetadata,
    getClosestNode,
} from '@alilc/lowcode-utils';
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
import {
    ComponentMetadata,
    ComponentSchema,
    TransformStage,
    ActivityData,
    Package,
    NodeSchema,
} from '@alilc/lowcode-types';

import {
    ISimulatorHost,
    Component,
    NodeInstance,
    ComponentInstance,
    DropContainer,
    IViewport,
} from '../simulator';

import {
    Designer,
} from '../designer';
import { BuiltinSimulatorRenderer, SimulatorRendererContainer } from './renderer';

import { createSimulator } from './create-simulator';

import { Project } from '../project';

export interface LibraryItem extends Package{
    package: string;
    library: string;
    urls?: Asset;
    editUrls?: Asset;
}

export interface BuiltinSimulatorProps {
    // 从 documentModel 上获取
    // suspended?: boolean;
    designMode?: 'live' | 'design' | 'preview' | 'extend' | 'border';
    device?: 'mobile' | 'iphone' | string;
    deviceClassName?: string;
    environment?: Asset;
    // @TODO 补充类型
    /** @property 请求处理器配置 */
    requestHandlersMap?: any;
    extraEnvironment?: Asset;
    library?: LibraryItem[];
    utilsMetadata?: UtilsMetadata;
    simulatorUrl?: Asset;
    theme?: Asset;
    componentsAsset?: Asset;
    [key: string]: any;
}

export interface DeviceStyleProps {
    canvas?: object;
    viewport?: object;
}

export class BuiltinSimulatorHost implements ISimulatorHost<BuiltinSimulatorProps> {
    isSimulator: true;
    viewport: IViewport;
    readonly project: Project;
    private _iframe?: HTMLIFrameElement;


    readonly designer: Designer;

    @obx.ref _props: BuiltinSimulatorProps = {};

    @computed get deviceStyle(): DeviceStyleProps | undefined {
        return this.get('deviceStyle');
    }

    @computed get deviceClassName(): string | undefined {
        return this.get('deviceClassName');
    }

    @computed get device(): string {
        return this.get('device') || 'default';
    }

    @obx.ref private _contentWindow?: Window;

    get contentWindow() {
      return this._contentWindow;
    }

    @obx.ref private _contentDocument?: Document;

    get contentDocument() {
      return this._contentDocument;
    }

    @computed get designMode(): 'live' | 'design' | 'preview' {
        // renderer 依赖
        // TODO: 需要根据 design mode 不同切换鼠标响应情况
        return this.get('designMode') || 'design';
    }


    constructor(project: Project) {
        makeObservable(this);
        this.project = project;
        this.designer = project?.designer;
    }

    /**
     * @see ISimulator
     */
    setProps(props: BuiltinSimulatorProps) {
        this._props = props;
    }

    get(key: string): any {
        if (key === 'device') {
          return (
            this.designer?.editor?.get('deviceMapper')?.transform?.(this._props.device) ||
            this._props.device
          );
        }
        return this._props[key];
    }

    set(key: string, value: any): void {
        throw new Error('Method not implemented.');
    }

      /**
   * 有 Renderer 进程连接进来，设置同步机制
   */
  connect(
    renderer: BuiltinSimulatorRenderer,
    effect: (reaction: IReactionPublic) => void, options?: IReactionOptions,
  ) {
    this._renderer = renderer;
    return autorun(effect, options);
  }

  private _renderer?: BuiltinSimulatorRenderer;

  get renderer() {
    return this._renderer;
  }


    async mountContentFrame(iframe: HTMLIFrameElement | null) {
        if (!iframe || this._iframe === iframe) {
            return;
        }
        this._iframe = iframe;
        const renderer = await createSimulator(this, iframe);
        const simulatorRenderer = new SimulatorRendererContainer()
        simulatorRenderer.dispose();
        iframe.addEventListener('load', async () => {
            this._contentWindow = iframe.contentWindow!;
            this._contentDocument = this._contentWindow.document;
            // wait 准备 iframe 内容、依赖库注入
            hotkey.mount(iframe.contentWindow as Window);
            this.setupEvents();
        });
    }

    setupEvents() {
        this.setupDetecting();
    }

/**
   * 设置悬停处理
   */
  setupDetecting() {
    const doc = this.contentDocument!;
    const { detecting, dragon } = this.designer;
    const hover = (e: MouseEvent) => {
        if (!detecting.enable || this.designMode !== 'design') {
            return;
        }
        const nodeInst = this.getNodeInstanceFromElement(e.target as Element);
        if (nodeInst?.node) {
          let node = nodeInst.node;
          const focusNode = node.document?.focusNode;
          if (node.contains(focusNode)) {
            node = focusNode;
          }
          detecting.capture(node);
        } else {
          detecting.capture(null);
        }
        if (!engineConfig.get('enableMouseEventPropagationInCanvas', false) || dragon.dragging) {
          e.stopPropagation();
        }

    };
    const leave = () => detecting.leave(this.project.currentDocument);
    doc.addEventListener('mouseover', hover, true);
    doc.addEventListener('mouseleave', leave, false);

    // doc.addEventListener(
    //     'mousemove',
    //     (e: Event) => {
    //       if (!engineConfig.get('enableMouseEventPropagationInCanvas', false) || dragon.dragging) {
    //         e.stopPropagation();
    //       }
    //     },
    //     true,
    // );
  }

  getNodeInstanceFromElement(target: Element | null): NodeInstance<ComponentInstance> | null {
    if (!target) {
      return null;
    }

    const nodeIntance = this.getClosestNodeInstance(target);
    console.log('********7', nodeIntance);
    if (!nodeIntance) {
      return null;
    }
    const { docId } = nodeIntance;
    const doc = this.project.getDocument(docId)!;
    // const node = doc.getNode(nodeIntance.nodeId);
    return {
      ...nodeIntance,
    //   node,
    };
  }

    setSuspense(suspensed: boolean): void {
        throw new Error('Method not implemented.');
    }
    setNativeSelection(enableFlag: boolean): void {
        throw new Error('Method not implemented.');
    }
    setDraggingState(state: boolean): void {
        throw new Error('Method not implemented.');
    }
    setCopyState(state: boolean): void {
        throw new Error('Method not implemented.');
    }
    clearState(): void {
        throw new Error('Method not implemented.');
    }
    scrollToNode(node: Node, detail?: any): void {
        throw new Error('Method not implemented.');
    }
    generateComponentMetadata(componentName: string): ComponentMetadata {
        throw new Error('Method not implemented.');
    }
    getComponent(componentName: string) {
        throw new Error('Method not implemented.');
    }
    getComponentInstances(node: Node): ComponentInstance[] | null {
        throw new Error('Method not implemented.');
    }
    createComponent(schema: NodeSchema): Component | null {
        throw new Error('Method not implemented.');
    }
    getComponentContext(node: Node): object | null {
        throw new Error('Method not implemented.');
    }
    /**
   * @see ISimulator
   */
   getClosestNodeInstance(
        from: ComponentInstance,
        specId?: string,
    ): NodeInstance<ComponentInstance> | null {
        return this.renderer?.getClosestNodeInstance(from, specId) || null;
    }

    computeRect(node: Node): DOMRect | null {
        throw new Error('Method not implemented.');
    }
    computeComponentInstanceRect(instance: ComponentInstance, selector?: string | undefined): DOMRect | null {
        throw new Error('Method not implemented.');
    }
    findDOMNodes(instance: ComponentInstance, selector?: string | undefined): (Element | Text)[] | null {
        throw new Error('Method not implemented.');
    }
    postEvent(evtName: string, evtData: any): void {
        throw new Error('Method not implemented.');
    }
    rerender(): void {
        throw new Error('Method not implemented.');
    }
    purge(): void {
        throw new Error('Method not implemented.');
    }
}