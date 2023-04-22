import React, { Component } from 'react';
import { BuiltinSimulatorHost } from '../host';
import { observer } from '@alilc/lowcode-editor-core';
import { BorderDetecting } from './border-detecting';
import { BorderSelecting } from './border-selecting';

import './bem-tools.less';
import './borders.less';


@observer
export class BemTools extends Component<{ host: BuiltinSimulatorHost }> {
    render() {
        const { host } = this.props;

        return (
          <div className="lc-bem-tools">
            <BorderSelecting key="selecting" host={host} />
            <BorderDetecting host={host} />
          </div>
        );
    }
}