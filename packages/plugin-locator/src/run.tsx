import { Component } from 'react';
import { Locator } from './locator';
import { observer } from '@firefly/auto-editor-core';

@observer
export class RunView extends Component<{ locator: Locator }> {
    render() {
        const { locator } = this.props;
        return locator.active ? (
          <div>
            test
          </div>
        ) : null;
    }
}