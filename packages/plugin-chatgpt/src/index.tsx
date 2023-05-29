
import React from 'react';
import classNames from 'classnames';
import { Editor } from '@firefly/auto-editor-core';
import { IconEdit } from './IconEdit';
import { IconSave } from './IconSave';
import { IconSeed } from './IconSeed';
import { chatgptConnect, chatgptGetAppKey, chatgptGenerate } from '../api';
import './index.less';
import { Input } from 'antd';
import { ChatCompletionRequestMessage, Role } from '../types';
import ContentMessage from './components/content';

const { TextArea } = Input;


export interface PluginProps {
    editor: Editor;
}

interface ComponentPaneProps extends PluginProps {
    [key: string]: any;
}

interface ComponentPaneState {
    showKeyInput: boolean;
    chatgptKey: string;
    messages: ChatCompletionRequestMessage[];
    sendMessage: string;
    hasConnect: boolean;
}

export default class ChatgptPane extends React.Component<ComponentPaneProps, ComponentPaneState> {
    static displayName = 'AutoChatgptPane';
    constructor(props: ComponentPaneProps) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.getAppKey();
    }

    state: ComponentPaneState = {
        showKeyInput: false,
        chatgptKey: '',
        messages: [],
        sendMessage: '',
        hasConnect: false,
    };

    async getAppKey() {
      const res = await chatgptGetAppKey();
      if (res && res.data && res.data.appKey) {
        this.setState({
          chatgptKey: res.data.appKey,
        });
      }
    }

    async toggle() {
      const { showKeyInput } = this.state;
      if (showKeyInput && this.state.chatgptKey) {
        const res = await chatgptConnect({ appKey: this.state.chatgptKey });
        // hasConnect
        console.log('********', res);
      }
      this.setState((prevState) => ({ showKeyInput: !prevState.showKeyInput }));
    }

    handleChatgptKeyChange = (e: any) => {
      this.setState({
        chatgptKey: e.target.value,
      });
    };

    onSendMessage = async () => {
      const { sendMessage, messages } = this.state;
      if (!sendMessage) return;
      const message = {
        role: Role.user,
        content: sendMessage,
      };
      messages.push(message);
      this.setState({
        messages,
        sendMessage: '',
      });
      const res = await chatgptGenerate(message);
      const { data } = res;
      if (data && data.message) {
        messages.push({
          role: Role.assistant,
          content: data.message,
        });
        this.setState({
          messages,
        });
      }
    };

    handlerSendMessage = (e: any) => {
      this.setState({
        sendMessage: e.target.value,
      });
    };

    render() {
        const { showKeyInput, messages } = this.state;
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
                showKeyInput ? <Input className={classNames('edit-input')} onChange={this.handleChatgptKeyChange} value={this.state.chatgptKey} placeholder="chatgpt appkey" /> : null
              }
            </div>
            <div className="message-box">
              {
                messages.map((item) => {
                  return (
                    <div>
                      <div>
                        <span className="role-name">{item.role}</span>
                      </div>
                      <div>
                        <ContentMessage content={item.content} />
                      </div>
                    </div>
                  );
                })
              }
            </div>
            <div className={classNames('send-box')}>
              <TextArea className={classNames('send-input')} autoSize bordered={false} value={this.state.sendMessage} onChange={this.handlerSendMessage} />
              <button className={classNames('send-btn')} onClick={this.onSendMessage}>
                {IconSeed({})}
              </button>
            </div>
          </div>
        );
    }
}