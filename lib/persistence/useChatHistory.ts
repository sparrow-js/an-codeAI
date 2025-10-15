import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { atom } from 'nanostores';
import type { Message } from 'ai';
import { toast } from 'react-toastify';
import { workbenchStore } from '@/lib/stores/workbench';
import { logStore } from '@/lib/stores/logs';
import { nanoid } from 'nanoid';
import { v4 as uuidv4 } from 'uuid';
import type { IChatMetadata, ArtifactSnapshot } from './types';

export interface ChatHistoryItem {
  id: string;
  shortId?: string;
  urlId?: string;
  description?: string;
  messages: Message[];
  timestamp: string;
  metadata?: IChatMetadata;
  status?: string;
  artifactSnapshots?: ArtifactSnapshot[]; // 新增：Artifact 快照数组
}

// 导出全局状态
export const chatId = atom<string | undefined>(undefined);
export const appId = atom<string | undefined>(undefined);
export const description = atom<string | undefined>(undefined);
export const chatMetadata = atom<IChatMetadata | undefined>(undefined);

export function useChatHistory() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const [ready, setReady] = useState(false);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [urlId, setUrlId] = useState<string>('');
  const [chatStatus, setChatStatus] = useState<string>('running');
  const [artifactSnapshots, setArtifactSnapshots] = useState<ArtifactSnapshot[]>([]); // 新增：存储快照数据
  const lastSavedMessagesRef = useRef<string>('');

  const mixedId = params?.id as string;

  useEffect(() => {
    if (mixedId) {
      fetch(`/api/chats/${mixedId}`)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch chat');
          }
          const data = await response.json();
          if (data.cloudflareDeploymentStatus) {
            workbenchStore.previewDeploymentStatus.set(data.cloudflareDeploymentStatus.status);
          }
          return data.chat;
        })
        .then((storedMessages: ChatHistoryItem) => {
          if (storedMessages) {
            setChatStatus(storedMessages.status || 'running');
          }
          if (storedMessages && storedMessages.status === 'init' && storedMessages.messages.length > 0) {
            workbenchStore.reset();
            const filteredMessages = storedMessages.messages;

            setInitialMessages(filteredMessages);
            setUrlId(storedMessages.urlId || '');
            chatId.set(storedMessages.id);
            appId.set(`app-${storedMessages.id}`);
            workbenchStore.shortUrl.set(storedMessages.shortId || '');
            workbenchStore.setIsFirstDeploy(true);
            // 新增：保存快照数据
            // setArtifactSnapshots(storedMessages.artifactSnapshots || []);
            // workbenchStore.setDeploymentStatus('completed');
            // chatMetadata.set(storedMessages.metadata);
            setReady(true);
            return;
          }
          if (storedMessages && storedMessages.messages.length > 0) {
            const rewindId = searchParams?.get?.('rewindTo');
            const filteredMessages = rewindId
              ? storedMessages.messages.slice(0, storedMessages.messages.findIndex((m) => m.id === rewindId) + 1)
              : storedMessages.messages;

            setInitialMessages(filteredMessages);
            setUrlId(storedMessages.urlId || '');
            description.set(storedMessages.description || '');
            chatId.set(storedMessages.id);
            appId.set(`app-${storedMessages.id}`);
            workbenchStore.shortUrl.set(storedMessages.shortId || '');
            // 新增：保存快照数据
            setArtifactSnapshots(storedMessages.artifactSnapshots || []);
            workbenchStore.setDeploymentStatus('completed');
            workbenchStore.previews.set([{
              port: 3000,
              ready: true,
              baseUrl: `https://${appId.get()?.replace('app-', 'preview--')}.pages.dev/`,
              isLoading: true,
              loadingProgress: 0
            }]);
            chatMetadata.set(storedMessages.metadata);

            // 新增：如果有快照，恢复 artifacts
            // if (storedMessages.artifactSnapshots && storedMessages.artifactSnapshots.length > 0) {
            //   workbenchStore.restoreFromSnapshots(storedMessages.artifactSnapshots);
            // }
          } else {
            router.push('/');
          }
          setReady(true);
        })
        .catch((error) => {
          logStore.logError('Failed to load chat messages', error);
          toast.error(error.message);
          setReady(true);
        });
    }
  }, [mixedId]);

  return {
    ready: !mixedId || ready,
    initialMessages,
    chatStatus,
    setChatStatus,
    artifactSnapshots, // 新增：返回快照数据
    updateChatMestaData: async (metadata: IChatMetadata) => {
      const id = chatId.get();
      if (!id) return;

      try {
        const response = await fetch('/api/chats/metadata', {
          method: 'PUT',
          body: JSON.stringify({ id, metadata }),
        });
        
        if (!response.ok) throw new Error('Failed to update metadata');
        chatMetadata.set(metadata);
      } catch (error) {
        toast.error('Failed to update chat metadata');
        console.error(error);
      }
    },
    storeMessageHistory: async (messages: Message[]) => {
      if (messages.length === 0) return;

      // 比较消息是否有实质性变化，避免不必要的保存
      const messagesJson = JSON.stringify(messages.map(m => ({ id: m.id, content: m.content, role: m.role })));
      if (messagesJson === lastSavedMessagesRef.current) {
        return; // 如果消息没有变化，直接返回
      }
      
      // 更新缓存
      lastSavedMessagesRef.current = messagesJson;

      const { firstArtifact } = workbenchStore;
      const currentId = chatId.get();

      try {
        if (!urlId && firstArtifact?.id) {
          const urlId = nanoid();
          // navigateChat(appId.get() || '');
          setUrlId(appId.get() || '');
          chatId.set(appId.get()?.replace('app-', '') || '');
          // workbenchStore.currentView.set('code');
        }

        // if (!description.get() && firstArtifact?.title) {
        //   description.set(firstArtifact?.title);
        // }

        // if (initialMessages.length === 0 && !currentId) {

        //   chatId.set(appId.get()?.replace('app-', '') || '');

        //   workbenchStore.setDeploymentStatus('pending');
          
        //   workbenchStore.setDeploymentStatus('completed');
        //   workbenchStore.setIsFirstDeploy(true);

        //   if (!urlId) {
        //     navigateChat(chatId.get() || '');
        //   }
        // }
      } catch (error) {
        toast.error('Failed to save chat');
        console.error(error);
      }
    },
    duplicateCurrentChat: async (listItemId: string) => {
      if (!mixedId && !listItemId) return;

      try {
        const response = await fetch('/api/chats/duplicate', {
          method: 'POST',
          body: JSON.stringify({ id: mixedId || listItemId }),
        });
        
        if (!response.ok) throw new Error('Failed to duplicate chat');
        const { urlId: newId } = await response.json();
        
        router.push(`/chat/${newId}`);
        toast.success('Chat duplicated successfully');
      } catch (error) {
        toast.error('Failed to duplicate chat');
        console.error(error);
      }
    },
    importChat: async (description: string, messages: Message[]) => {
      try {
        const newId = uuidv4();
        const urlId = nanoid();

        // 创建新的聊天记录
        await fetch('/api/chats', {
          method: 'POST',
          body: JSON.stringify({
            id: newId,
            messages,
            urlId,
            description,
            metadata: {},
            status: 'running',
          }),
        });

        router.push(`/chat/${urlId}`);
        toast.success('Chat imported successfully');
      } catch (error) {
        toast.error('Failed to import chat');
        console.error(error);
      }
    },
    exportChat: async () => {
      try {
        const response = await fetch(`/api/chats/export/${mixedId}`);
        if (!response.ok) throw new Error('Failed to export chat');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-${mixedId}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Chat exported successfully');
      } catch (error) {
        toast.error('Failed to export chat');
        console.error(error);
      }
    },
  };
}

function navigateChat(nextId: string) {
  const url = new URL(window.location.href);
  url.pathname = `/chat/${nextId}`;
  window.history.replaceState({}, '', url);
}
