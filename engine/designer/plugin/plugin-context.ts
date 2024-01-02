/* eslint-disable no-multi-assign */
import { Editor, EngineConfig, engineConfig, Hotkey, hotkey } from '../../editor-core';
import { Designer  } from '../designer';
import {ILowCodePluginManager} from './plugin-types';
import {Project} from '../project';

// import { Skeleton } from '@firefly/auto-editor-skeleton';
class Skeleton{}

// import {
//   Hotkey,
//   Project,
//   Skeleton,
//   Setters,
//   Material,
//   Event,
//   editorSymbol,
//   designerSymbol,
//   skeletonSymbol,
// } from '@alilc/lowcode-shell';
import { getLogger, Logger } from '../../utils';
import {
  ILowCodePluginContext,
  IPluginContextOptions,
  ILowCodePluginPreferenceDeclaration,
  PreferenceValueType,
  IPluginPreferenceMananger,
} from './plugin-types';
import { isValidPreferenceKey } from './plugin-utils';

export default class PluginContext implements ILowCodePluginContext {
//   private readonly [editorSymbol]: Editor;
//   private readonly [designerSymbol]: Designer;
//   private readonly [skeletonSymbol]: InnerSkeleton;
  hotkey: Hotkey;
  project: Project;
  skeleton: Skeleton;
  logger: Logger;
//   setters: Setters;
//   material: Material;
  config: EngineConfig;
  event?: Event;
  plugins: ILowCodePluginManager;
  preference: IPluginPreferenceMananger = {
    getPreferenceValue(
      key: string,
      defaultValue?: PreferenceValueType
    ): PreferenceValueType | undefined  {
        return undefined
    }
  };

  constructor(plugins: ILowCodePluginManager, options: IPluginContextOptions) {
    const editor = plugins.editor;
    const designer = editor.get('designer')!;
    const skeleton = editor.get('skeleton')!;

    const { pluginName = 'anonymous' } = options;
    const project = designer?.project;
    this.hotkey = hotkey;
    this.project = project;
    this.skeleton = skeleton;
    // this.setters = new Setters();
    // this.material = new Material(editor);
    this.config = engineConfig;
    this.plugins = plugins;
    // this.event = new Event(editor, { prefix: 'common' });
    this.logger = getLogger({ level: 'warn', bizName: `designer:plugin:${pluginName}` });

    const enhancePluginContextHook = engineConfig.get('enhancePluginContextHook');
    if (enhancePluginContextHook) {
      enhancePluginContextHook(this);
    }
  }

  setPreference(
    pluginName: string,
    preferenceDeclaration: ILowCodePluginPreferenceDeclaration,
  ): void {
    const getPreferenceValue = (
      key: string,
      defaultValue?: PreferenceValueType,
      ): PreferenceValueType | undefined => {
      if (!isValidPreferenceKey(key, preferenceDeclaration)) {
        return undefined;
      }
      const pluginPreference = this.plugins.getPluginPreference(pluginName) || {};
      if (pluginPreference[key] === undefined || pluginPreference[key] === null) {
        return defaultValue;
      }
      return pluginPreference[key];
    };

    this.preference = {
      getPreferenceValue,
    };
  }
}
