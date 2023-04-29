
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
import Viewport from './viewport';
import {
    Designer,
    isShaken,
    DragObjectType,
} from '../designer';
import { BuiltinSimulatorRenderer, SimulatorRendererContainer } from './renderer';

import { createSimulator } from './create-simulator';

import { Project } from '../project';
import { Node } from '../document';
import { getClosestClickableNode } from './utils/clickable';

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
    readonly viewport = new Viewport();
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

    get currentDocument() {
        return this.project.currentDocument;
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
    effect: (reaction: IReactionPublic) => void, options?: any,
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
        this.setupDragAndClick();
        this.setupDetecting();
    }

    setupDragAndClick() {
        const { designer } = this;
        const doc = this.contentDocument!;
        doc.addEventListener(
            'mousedown', (downEvent: MouseEvent) => {
                const documentModel = this.project.currentDocument;
                if (!documentModel) {
                    return;
                }
                const { selection } = documentModel;
                const nodeInst = this.getNodeInstanceFromElement(downEvent.target as Element);
                const nodeSchea = getClosestClickableNode(nodeInst, downEvent);
                const node = documentModel.createNode(nodeSchea);
                if (!node) {
                    return;
                }

                downEvent.stopPropagation();
                downEvent.preventDefault();

                const checkSelect = (e: MouseEvent) => {
                    doc.removeEventListener('mouseup', checkSelect, true);
                    if (!isShaken(downEvent, e)) {
                        let { id } = node;
                        selection.select(id);
                    }
                };
                let nodes: Node[] = [node];
                designer.dragon.boost(
                  {
                    type: DragObjectType.Node,
                    nodes,
                  },
                  downEvent,
                  undefined,
                );

                doc.addEventListener('mouseup', checkSelect, true);
            },
        );
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
        if (nodeInst) {
        //   let node = nodeInst.node;
        //   const focusNode = node.document?.focusNode;
        //   if (node.contains(focusNode)) {
        //     node = focusNode;
        //   }
          detecting.capture(nodeInst);
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

    /**
     * @see ISimulator
     */
    setNativeSelection(enableFlag: boolean) {
      this.renderer?.setNativeSelection(enableFlag);
    }

    /**
     * @see ISimulator
     */
    setDraggingState(state: boolean) {
      this.renderer?.setDraggingState(state);
    }

    /**
     * @see ISimulator
     */
    setCopyState(state: boolean) {
      this.renderer?.setCopyState(state);
    }

    /**
     * @see ISimulator
     */
    clearState() {
      this.renderer?.clearState();
    }

    private _sensorAvailable = true;

    /**
     * @see ISensor
     */
    get sensorAvailable(): boolean {
      return this._sensorAvailable;
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

    @obx private instancesMap: {
        [docId: string]: Map<string, ComponentInstance[]>;
    } = {};

    setInstance(docId: string, id: string, instances: ComponentInstance[] | null) {
        if (!hasOwnProperty(this.instancesMap, docId)) {
            this.instancesMap[docId] = new Map();
        }
        if (instances == null) {
            this.instancesMap[docId].delete(id);
        } else {
            this.instancesMap[docId].set(id, instances.slice());
        }
    }

    getComponentInstances(node: Node, context?: NodeInstance): ComponentInstance[] | null {
        const docId = 0;
        const instances = this.instancesMap[docId]?.get(node.id) || node.instance || null;
        if (!instances || !context) {
            return instances;
        }

        // filter with context
        return instances.filter((instance) => {
            return this.getClosestNodeInstance(instance, context.nodeId)?.instance === context.instance;
        });
    }
    createComponent(schema: NodeSchema): Component | null {
        throw new Error('Method not implemented.');
    }
    /**
     * @see ISimulator
     */
    getComponentContext(/* node: Node */): any {
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
        const renderer = this.renderer!;
        const elements = this.findDOMNodes(instance, selector);
        if (!elements) {
          return null;
        }

        const elems = elements.slice();
        let rects: DOMRect[] | undefined;
        let last: { x: number; y: number; r: number; b: number } | undefined;
        let _computed = false;
        while (true) {
          if (!rects || rects.length < 1) {
            const elem = elems.pop();
            if (!elem) {
              break;
            }
            rects = isElement(elem) ? [elem.getBoundingClientRect()] : [];
          }
          const rect = rects.pop();
          if (!rect) {
            break;
          }
          if (rect.width === 0 && rect.height === 0) {
            continue;
          }
          if (!last) {
            last = {
              x: rect.left,
              y: rect.top,
              r: rect.right,
              b: rect.bottom,
            };
            continue;
          }
          if (rect.left < last.x) {
            last.x = rect.left;
            _computed = true;
          }
          if (rect.top < last.y) {
            last.y = rect.top;
            _computed = true;
          }
          if (rect.right > last.r) {
            last.r = rect.right;
            _computed = true;
          }
          if (rect.bottom > last.b) {
            last.b = rect.bottom;
            _computed = true;
          }
        }

        if (last) {
          const r: any = new DOMRect(last.x, last.y, last.r - last.x, last.b - last.y);
          r.elements = elements;
          r.computed = _computed;
          return r;
        }

        return null;
    }
    /**
     * @see ISimulator
     */
    findDOMNodes(instance: ComponentInstance, selector?: string): Array<Element | Text> | null {
        const elements = [instance as Element];
        if (!elements) {
            return null;
        }

        if (selector) {
            const matched = getMatched(elements, selector);
            if (!matched) {
                return null;
            }
            return [matched];
        }
        return elements;
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

function getMatched(elements: Array<Element | Text>, selector: string): Element | null {
    let firstQueried: Element | null = null;
    for (const elem of elements) {
      if (isElement(elem)) {
        if (elem.matches(selector)) {
          return elem;
        }

        if (!firstQueried) {
          firstQueried = elem.querySelector(selector);
        }
      }
    }
    return firstQueried;
}

// export const FIBER_KEY = '_reactInternalFiber';
// export function isDOMNode(node: any): node is Element | Text {
//     return node.nodeType && (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE);
// }

// function elementsFromFiber(fiber: any, elements: Array<Element | Text>) {
//     if (fiber) {
//       if (fiber.stateNode && isDOMNode(fiber.stateNode)) {
//         elements.push(fiber.stateNode);
//       } else if (fiber.child) {
//         // deep fiberNode.child
//         elementsFromFiber(fiber.child, elements);
//       }

//       if (fiber.sibling) {
//         elementsFromFiber(fiber.sibling, elements);
//       }
//     }
// }

// export function reactFindDOMNodes(elem: ReactInstance | null): Array<Element | Text> | null {
//     if (!elem) {
//       return null;
//     }
//     if (isElement(elem)) {
//       return [elem];
//     }
//     const elements: Array<Element | Text> = [];
//     const fiberNode = (elem as any)[FIBER_KEY];
//     elementsFromFiber(fiberNode?.child, elements);
//     if (elements.length > 0) return elements;
//     try {
//       return [findDOMNode(elem)];
//     } catch (e) {
//       return null;
//     }
// }