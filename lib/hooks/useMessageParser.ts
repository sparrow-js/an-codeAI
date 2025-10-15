import type { Message } from 'ai';
import { useCallback, useState, useRef } from 'react';
import { StreamingMessageParser } from '@/lib/runtime/message-parser';
import { workbenchStore } from '@/lib/stores/workbench';
import { createScopedLogger } from '@/utils/logger';
import type { ArtifactSnapshot } from '@/lib/persistence/types';
import { description } from '../persistence/useChatHistory';

const logger = createScopedLogger('useMessageParser');
const tmpPath = new Set();

// 创建一个简单的节流函数
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    lastArgs = args;
    
    if (!inThrottle) {
      inThrottle = true;
      func.apply(this, args);
      
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs && lastArgs !== args) {
          func.apply(this, lastArgs);
          lastArgs = null;
        }
      }, limit);
    }
  };
}

// 创建节流版本的 runAction
const throttledRunAction = throttle((data, isStreaming) => {
  workbenchStore.runAction(data, isStreaming);
}, 100); // 100ms 节流

const messageParser = new StreamingMessageParser({
  callbacks: {
    onArtifactOpen: (data) => {
      logger.trace('onArtifactOpen', data);
      workbenchStore.showWorkbench.set(true);
      workbenchStore.addArtifact(data);
    },
    onArtifactClose: (data) => {
      logger.trace('onArtifactClose');
      workbenchStore.updateArtifact(data, { closed: true });
      if (!description.get()) {
        description.set(data?.title);
      }
    },
    onActionOpen: (data) => {
      logger.trace('onActionOpen', data.action);
      // we only add shell actions when when the close tag got parsed because only then we have the content
      if (data.action.type === 'file') {
        workbenchStore.addAction(data);
      }
    },
    onActionClose: (data) => {
      logger.trace('onActionClose', data.action);
      if (data.action.type !== 'file') {
        workbenchStore.addAction(data);
      }

      // if (data.action.type === 'file' && data.action.filePath.includes('src/App.tsx')) {
      //   workbenchStore.setRouterList(data.action.content);
      // }

      workbenchStore.runAction(data);
    },
    onActionStream: (data) => {

      if (workbenchStore.startStreaming.get() === false) {
        workbenchStore.startStreaming.set(true);
        workbenchStore.resetGeneratedFiles();
      }
      

      if (data.action.type === 'file') {
        workbenchStore.setGeneratedFile(`/home/project/${data.action.filePath}`);
      }

      logger.trace('onActionStream', data.action);
      
      // 使用节流版本的 runAction 减少频繁调用
      throttledRunAction(data, true);
    },
  },
});

export function useMessageParser() {
  const [parsedMessages, setParsedMessages] = useState<{ [key: number]: string }>({});
  // 使用 ref 来跟踪最后一次解析的内容，避免不必要的状态更新
  const lastParsedRef = useRef<{ [key: number]: string }>({});

  // 新增：从快照恢复 Artifacts
  const restoreFromSnapshots = useCallback((snapshots: ArtifactSnapshot[]) => {
    if (snapshots.length === 0) return;

    // 标记所有快照中的消息为已恢复，跳过解析
    for (const snapshot of snapshots) {
      messageParser.markAsRestored(snapshot.messageId);
    }

    // 从快照恢复 artifacts
    workbenchStore.restoreFromSnapshots(snapshots);

    logger.trace('Restored artifacts from snapshots', snapshots.length);
  }, []);

  const parseMessages = useCallback((messages: Message[], isLoading: boolean) => {
    let reset = false;
    let updates: { [key: number]: string } = {};
    let hasChanges = false;

    if (!isLoading) {
      reset = true;
      messageParser.reset();
      lastParsedRef.current = {};
    }

    for (const [index, message] of messages.entries()) {
      if (message.role === 'assistant' || message.annotations?.includes('manually_edited')) {
        const newParsedContent = messageParser.parse(message.id, message.content);
        
        // 计算新内容
        const updatedContent = !reset 
          ? (lastParsedRef.current[index] || '') + newParsedContent 
          : newParsedContent;
        
        // 只有当内容真正变化时才更新
        if (updatedContent !== lastParsedRef.current[index]) {
          updates[index] = updatedContent;
          lastParsedRef.current[index] = updatedContent;
          hasChanges = true;
        }
      }
    }

    // 只有当有变化时才更新状态
    if (hasChanges && Object.keys(updates).length > 0) {
      setParsedMessages((prevParsed) => ({
        ...prevParsed,
        ...updates
      }));
    }
  }, []);

  return { parsedMessages, parseMessages, restoreFromSnapshots };
}
