import React from 'react';
import { observer, globalContext } from '@firefly/auto-editor-core';
import { Popover, Button, List, Skeleton, Checkbox, Tooltip } from 'antd';
import { Chatgpt } from '../../chatgpt';
import { IconReview, IconNote, IconReconfiguration, IconSync } from '../icon';
import {
    Designer,
} from '@firefly/auto-designer';
import { editInsertNode } from '../../../api';

interface ComponentPaneProps {
    chatgpt: Chatgpt;
}

interface ComponentPaneState {
    open: boolean;
}
@observer
export default class CodeAuto extends React.Component<
  ComponentPaneProps,
  ComponentPaneState
> {
    state: ComponentPaneState = {
        open: false,
    };

    hide = () => {
        this.setState({
            open: false,
        });
    };

    handleOpenChange = () => {
        this.setState({
            open: true,
        });
    };
    onChange = (value: string[]) => {
        const { chatgpt } = this.props;
        chatgpt.setSelectedFiles(value);
        console.log('***', value);
    };

    content() {
        const { chatgpt } = this.props;

        return (
          <div>
            <Checkbox.Group style={{ width: '100%' }} onChange={this.onChange} value={chatgpt.selectedFiles}>
              <List
                className="demo-loadmore-list"
                itemLayout="horizontal"
                dataSource={chatgpt.changeFiles}
                renderItem={(item) => (
                  <List.Item
                    actions={[<Checkbox value={item.value} />]}
                  >
                    <div>{item.value}</div>
                  </List.Item>
                )}
              />
            </Checkbox.Group>
          </div>
        );
    }

    handlerCode = (value: string) => {
        return () => {
            const { chatgpt } = this.props;
            chatgpt.getWatchChangeFiles();
        };
    };

    syncToCode = async () => {
        const editor = globalContext.get('editor');
        const designer: Designer = editor.get('designer');
        const selection = designer.currentDocument?.selection;
        if (selection) {
          const nodes = selection.getNodes();
          const node = nodes[0];
          if (node) {
            const { instance } = node;
            const unique = instance.dataset['unique'];
            const interval = unique.split('::');
            const res = await editInsertNode({
              path: node.id.split('::')[0],
              start: interval[0],
              end: interval[1],
              position: 0,
              content: this.props.chatgpt.selection,
            });
            console.log('********000', res);
          }
        }
      };

    render() {
        return (
          <div>
            <Tooltip title="同步">
              <span className="mr-6 red-5" onClick={this.handlerCode('sync')}>
                {IconSync({})}
              </span>
            </Tooltip>
            <Popover
              content={this.content()}
              placement="bottom"
              title={<span onClick={this.hide}>关闭</span>}
              trigger="click"
              open={this.state.open}
              onOpenChange={this.handleOpenChange}
            >
              <Tooltip title="code review">
                <span className="mr-6" onClick={this.handlerCode('codeReview')}>
                  {IconReview({})}
                </span>
              </Tooltip>

              <Tooltip title="代码注释">
                <span className="mr-6" onClick={this.handlerCode('note')}>
                  {IconNote({})}
                </span>
              </Tooltip>
              <Tooltip title="代码重构">
                <span className="mr-6">
                  {IconReconfiguration({})}
                </span>
              </Tooltip>

            </Popover>
          </div>
        );
    }
}