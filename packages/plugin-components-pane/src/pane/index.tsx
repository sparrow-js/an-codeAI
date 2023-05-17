
import React from 'react';
import classNames from 'classnames';
import { Editor, globalContext } from '@firefly/auto-editor-core';
import Component from '../components/Component';

export interface PluginProps {
    editor: Editor;
}

interface ComponentPaneProps extends PluginProps {
    [key: string]: any;
}

interface ComponentPaneState {
    keyword: string;
}
export default class ComponentPane extends React.Component<ComponentPaneProps, ComponentPaneState> {
    static displayName = 'LowcodeComponentPane';


    registerAdditive = (shell: HTMLDivElement | null) => {
      if (!shell || shell.dataset.registered) {
        return;
      }
      const { editor } = this.props;
      const designer = editor?.get('designer');
      const _dragon = designer?.dragon;
      if (!_dragon || (!designer)) {
        return;
      }

      // eslint-disable-next-line
      const click = (e: Event) => {};

      shell.addEventListener('click', click);

      _dragon.from(shell, (e: Event) => {
        const doc = designer?.currentDocument;
        const id = 'title';
        if (!doc || !id) {
          return false;
        }

        const dragTarget = {
          type: 'nodedata',
          data: {
            id,
          },
        };

        return dragTarget;
      });

      shell.dataset.registered = 'true';
    };

    renderContent() {
        return (
          <div ref={this.registerAdditive}>
            <Component
              data={{
                title: 'Text',
                icon: '',
                snippets: [{
                  id: 'Text',
                }],
              }}
              key={'Text'}
            />
            <Component
              data={{
                title: 'img',
                icon: '',
                snippets: [{
                  id: 'img',
                }],
              }}
              key={'img'}
            />
          </div>
        );
    }

    render() {
        return (
          <div className={classNames('lowcode-component-panel')}>
            {this.renderContent()}
          </div>
        );
    }
}