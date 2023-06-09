
import React from 'react';
import classNames from 'classnames';
import { Editor, observer, globalContext } from '@firefly/auto-editor-core';
import { IconEdit } from './IconEdit';
import { IconSave } from './IconSave';
import { IconSeed } from './IconSeed';
import { IconConnect } from './IconConnect';
import { chatgptConnect, chatgptGetAppKey, editInsertNode } from '../api';
import './index.less';
import { Input, Select, Button } from 'antd';
import ContentMessage from './components/content';
import { Chatgpt } from './chatgpt';
import {
  Designer,
} from '@firefly/auto-designer';
import CodeAuto from './components/code-auto';

const { TextArea } = Input;


export interface PluginProps {
    editor: Editor;
}

interface ComponentPaneProps extends PluginProps {
    [key: string]: any;
}

interface ComponentPaneState {
    showKeyInput: boolean;
    sendMessage: string;
}

@observer
export default class ChatgptPane extends React.Component<ComponentPaneProps, ComponentPaneState> {
    static displayName = 'AutoChatgptPane';
    chatgpt: Chatgpt;
    private messageBox: HTMLDivElement | null = null;

    constructor(props: ComponentPaneProps) {
        super(props);
        this.chatgpt = new Chatgpt();
        this.toggle = this.toggle.bind(this);
        this.getAppKey();
    }

    state: ComponentPaneState = {
        showKeyInput: false,
        sendMessage: '',
    };

    async getAppKey() {
      const res = await chatgptGetAppKey();
      if (res && res.data && res.data.appKey) {
        this.chatgpt.chatgptKey = res.data.appKey;
      }
    }

    async toggle() {
      const { showKeyInput } = this.state;
      if (showKeyInput && this.chatgpt.chatgptKey) {
        const res = await chatgptConnect({ appKey: this.chatgpt.chatgptKey });
        // hasConnect
        if (res.data) {
          this.chatgpt.hasConnect = true;
        }
      }
      this.setState((prevState) => ({ showKeyInput: !prevState.showKeyInput }));
    }

    handleChatgptKeyChange = (e: any) => {
      this.chatgpt.chatgptKey = e.target.value;
    };

    scrollBottom() {
      setTimeout(() => {
        this.messageBox?.scroll(0, this.messageBox.scrollHeight);
      }, 0);
    }

    onSendMessage = async () => {
      const { sendMessage } = this.state;
      this.setState({
        sendMessage: '',
      });
      const res = await this.chatgpt.chatgptGenerate(sendMessage);
      if (res) {
        this.scrollBottom();
      }
    };

    handlerSendMessage = (e: any) => {
      this.setState({
        sendMessage: e.target.value,
      });
    };

    handleChange = (value: string) => {
      console.log(`selected ${value}`);
    };

    handlePromptChange = (value: any) => {
      const { chatgpt } = this;
      chatgpt.setCodePrompt(value);
    };

    render() {
        const { messages } = this.chatgpt;
        const { showKeyInput } = this.state;
        return (
          <div className={classNames('auto-component-panel')}>
            <div className={classNames('edit-box')}>
              <span className="mr-6">
                {IconConnect({})}
              </span>
              <span onClick={this.toggle}>
                {showKeyInput ? IconSave({}) : IconEdit({
                    style: {
                        color: '',
                    },
                })}
              </span>
              {
                showKeyInput ? <Input className={classNames('edit-input')} onChange={this.handleChatgptKeyChange} value={this.chatgpt.chatgptKey} placeholder="chatgpt appkey" /> : null
              }
            </div>
            <div className="code-auto-box">
              <CodeAuto chatgpt={this.chatgpt} scrollBottom={this.scrollBottom} />
            </div>
            <div ref={(messageBox) => { this.messageBox = messageBox; }} className="message-box">
              {
                messages.map((item) => {
                  return item.from !== 'built-in' ? (
                    <div className="message-item">
                      <div>
                        <span className="role-name">{item.role}</span>
                      </div>
                      <div>
                        <ContentMessage content={item.content} chatgpt={this.chatgpt} />
                      </div>
                    </div>
                  ) : null;
                })
              }
            </div>
            <div className={classNames('send-box')}>
              <TextArea className={classNames('send-input')} autoSize bordered={false} value={this.state.sendMessage} onChange={this.handlerSendMessage} />
              <Button className="height-24 send-btn" onClick={this.onSendMessage} icon={IconSeed({})} />
            </div>
          </div>
        );
    }
}
