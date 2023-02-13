
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
    contentWindow?: Window | undefined;
    contentDocument?: Document | undefined;
    renderer?: any;
    readonly project: Project;

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

    constructor(project: Project) {
        makeObservable(this);
        this.project = project;
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

    async mountContentFrame(iframe: HTMLIFrameElement | null) {
        console.log('*');
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
    getClosestNodeInstance(from: ComponentInstance, specId?: string | undefined): NodeInstance<ComponentInstance> | null {
        throw new Error('Method not implemented.');
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