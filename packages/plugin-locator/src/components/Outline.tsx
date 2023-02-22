
import { Component, ReactNode } from 'react';
import { ComponentOutLineView } from './ComponentOutline';
import { Locator } from '../locator';
import { getElementInfo } from '../adapters/getElementInfo';
import { observer } from '@firefly/auto-editor-core';

@observer
export class OutLineView extends Component<{ locator: Locator }> {
    render() {
        const { currentElement } = this.props.locator;
        console.log('************7', currentElement);
        const elInfo = getElementInfo(currentElement, 'react');
        const box = currentElement.getBoundingClientRect();

        return (
          <>
            <div>
              <div
                style={{
                  position: 'fixed',
                  left: `${box.x}px`,
                  top: `${box.y}px`,
                  width: `${box.width}px`,
                  height: `${box.height}px`,
                  backgroundColor: 'rgba(222, 0, 0, 0.3)',
                  textShadow:
                    '-1px 1px 0 #fff, 1px 1px 0 #fff, 1px -1px 0 #fff, -1px -1px 0 #fff',
                    textOverflow: 'ellipsis',
                }}
              />
            </div>
            <ComponentOutLineView />
          </>
        );
    }
}