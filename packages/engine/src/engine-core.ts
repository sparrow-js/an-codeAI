
import { createElement } from 'react';
import { render } from 'react-dom';
import {
    Skeleton as InnerSkeleton,
} from '@firefly/auto-editor-skeleton';
import {
  Designer,
  AutoCodePluginManager,
  ILowCodePluginContext,
  PluginPreference,
} from '@firefly/auto-designer';
import { Editor } from '@firefly/auto-editor-core';
import getSkeletonCabin from './modules/skeleton-cabin';
import DesignerPlugin from '@firefly/auto-plugin-designer';

const editor = new Editor();
const innerSkeleton = new InnerSkeleton(editor);
const skeletonCabin = getSkeletonCabin(innerSkeleton);
const { Workbench } = skeletonCabin;

const plugins = new AutoCodePluginManager(editor).toProxy();

let engineInited = false;

(async function registerPlugins() {
  const defaultPanelRegistry = (ctx: ILowCodePluginContext) => {
    return {
      init() {
        innerSkeleton.add({
          area: 'mainArea',
          name: 'designer',
          type: 'Widget',
          content: DesignerPlugin,
        });
      },
    };
  };
  defaultPanelRegistry.pluginName = '___default_panel___';
  await plugins.register(defaultPanelRegistry);
})();

export async function init(
    container?: HTMLElement | null,
    options?: any,
    pluginPreference?: any,
) {
    if (engineInited) return;
    engineInited = true;

    let engineOptions = options;
    let engineContainer = container || document.createElement('div');
    await plugins.init(pluginPreference as any);
    render(
        createElement(Workbench, {
          skeleton: innerSkeleton,
          className: 'engine-main',
          topAreaItemClassName: 'engine-actionitem',
        }),
        engineContainer,
      );
    console.log('auto engine core init');
}