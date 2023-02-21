
import { Component, ReactNode } from 'react';
import { ComponentOutLineView } from './ComponentOutline';
import { Locator } from '../locator';
import { getElementInfo } from '../adapters/getElementInfo';

export class OutLineView extends Component<{ locator: Locator; targets: Targets }> {
    render() {
        const { currentElement } = this.props.locator;
        const elInfo = getElementInfo(currentElement, 'react');
        const box = currentElement.getBoundingClientRect();
        console.log(elInfo);
        // const box = currentEement.

        return (
          <>
            <div>
              <div
                style={{
                  position: 'fixed',

                }}
              />
            </div>
            <ComponentOutLineView />
          </>
        );
    }
}