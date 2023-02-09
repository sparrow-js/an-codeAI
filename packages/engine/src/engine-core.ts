
import { createElement } from 'react';
import { render } from 'react-dom';
import {
    Skeleton as InnerSkeleton,
} from '@firefly/auto-editor-skeleton';

import { Editor } from '@firefly/auto-editor-core';

const editor = new Editor();
const innerSkeleton = new InnerSkeleton(editor);


let engineInited = false;

export async function init(
    container?: HTMLElement,
    options?: any,
    pluginPreference?: any,
) {
    if (engineInited) return;
    engineInited = true;

    let engineOptions = options;
    let engineContainer = container;

    render(
        createElement(Workbench, {
          skeleton: innerSkeleton,
          className: 'engine-main',
          topAreaItemClassName: 'engine-actionitem',
        }),
        engineContainer,
      );
    console.log('auto engine core ******** init');
}