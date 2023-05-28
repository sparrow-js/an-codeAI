import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ComponentPaneProps {
    content: string;
}

interface ComponentPaneState {
    html: string;
}

export default class ContentMessage extends React.Component<
  ComponentPaneProps,
  ComponentPaneState
> {
  render() {
      return (
        <div>
          <ReactMarkdown>{this.props.content}</ReactMarkdown>
        </div>
      );
  }
}