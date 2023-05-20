
import React from 'react';
import classNames from 'classnames';
import { Editor } from '@firefly/auto-editor-core';
import { IconEdit } from './IconEdit';
import { IconSave } from './IconSave';
import { chatgptConnect } from '../api';

import './index.less';

export interface PluginProps {
    editor: Editor;
}

interface ComponentPaneProps extends PluginProps {
    [key: string]: any;
}

interface ComponentPaneState {
    showKeyInput: boolean;
}

export default class ChatgptPane extends React.Component<ComponentPaneProps, ComponentPaneState> {
    static displayName = 'AutoChatgptPane';
    constructor(props: ComponentPaneProps) {
        super(props);
        this.toggle = this.toggle.bind(this);
    }

    state = {
        showKeyInput: false,
    };

    toggle() {
        this.setState(prevState => ({ showKeyInput: !prevState.showKeyInput }));
    }

    render() {
        const { showKeyInput } = this.state;
        return (
          <div className={classNames('auto-component-panel')}>
            <div className={classNames('edit-box')}>
              <span onClick={this.toggle}>
                {showKeyInput ? IconSave({}) : IconEdit({
                    style: {
                        color: '',
                    },
                })}
              </span>
              {
                showKeyInput ? <input className={classNames('edit-input')} /> : null
              }
            </div>
          </div>
        );
    }
}