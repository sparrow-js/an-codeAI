import React, { PureComponent } from 'react';
import { Editor } from '@firefly/auto-editor-core';
import { Asset } from '@alilc/lowcode-utils';
import { DesignerView, Designer } from '@firefly/auto-designer';

import './index.less';

export interface PluginProps {
    editor: Editor;
}

interface DesignerPluginState {
    componentMetadatas?: any[] | null;
    library?: any[] | null;
    extraEnvironment?: any[] | null;
    renderEnv?: string;
    device?: string;
    locale?: string;
    designMode?: string;
    deviceClassName?: string;
    simulatorUrl: Asset | null;
    // @TODO 类型定义
    requestHandlersMap: any;
}

export default class DesignerPlugin extends PureComponent<PluginProps, DesignerPluginState> {
    static displayName: 'LowcodePluginDesigner';

    state: DesignerPluginState = {
      componentMetadatas: null,
      library: null,
      extraEnvironment: null,
      renderEnv: 'default',
      device: 'default',
      locale: '',
      designMode: 'live',
      deviceClassName: '',
      simulatorUrl: null,
      requestHandlersMap: null,
    };

    constructor(props: any) {
        super(props);
        console.log(this.props.editor);
    }


    render(): React.ReactNode {
        const {
            componentMetadatas,
            // utilsMetadata,
            library,
            extraEnvironment,
            renderEnv,
            device,
            designMode,
            deviceClassName,
            simulatorUrl,
            requestHandlersMap,
            locale,
        } = this.state;
        console.log(
            componentMetadatas,
            // utilsMetadata,
            library,
            extraEnvironment,
            renderEnv,
            device,
            designMode,
            deviceClassName,
            simulatorUrl,
            requestHandlersMap,
            locale,
        );
        return (
          <div>
            <DesignerView />
          </div>
        );
    }
}