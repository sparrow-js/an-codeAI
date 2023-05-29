import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    {...props}
                    style={dark}
                    language={match[1]}
                    PreTag="div"
                  >{String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                );
              },
            }}
          >{this.props.content}
          </ReactMarkdown>
        </div>
      );
  }
}