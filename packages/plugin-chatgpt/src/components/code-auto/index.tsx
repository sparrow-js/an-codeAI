import React from 'react';
import { observer } from '@firefly/auto-editor-core';
import { Popover, Button, List, Skeleton, Checkbox } from 'antd';
import { Chatgpt } from '../../chatgpt';


interface ComponentPaneProps {
    chatgpt: Chatgpt;
}

interface ComponentPaneState {
    open: boolean;
    list: any[];
}
@observer
export default class CodeAuto extends React.Component<
  ComponentPaneProps,
  ComponentPaneState
> {
    state: ComponentPaneState = {
        open: false,
        list: [
            {
                name: 'hello',
                select: false,
            },
            {
                name: 'world',
                select: false,
            },
            {
                name: 'avator',
                select: false,
            },
        ],
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
    onChange = (value: any) => {
        console.log('***', value);
    };

    content() {
        return (
          <div>
            <Checkbox.Group style={{ width: '100%' }} onChange={this.onChange} value={['hello']}>
              <List
                className="demo-loadmore-list"
                itemLayout="horizontal"
                dataSource={this.state.list}
                renderItem={(item) => (
                  <List.Item
                    actions={[<Checkbox value={item.name}>{item.name}</Checkbox>]}
                  >
                    <div>{item.name}</div>
                  </List.Item>
                )}
              />
            </Checkbox.Group>
          </div>
        );
    }

    render() {
        return (
          <div>
            <Popover
              content={this.content()}
              placement="bottom"
              title="Title"
              trigger="click"
              open={this.state.open}
              onOpenChange={this.handleOpenChange}
            >
              <Button>code review</Button>
              <Button>添加注释</Button>
            </Popover>
          </div>
        );
    }
}