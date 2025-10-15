import type { Message } from 'ai';
import type { ActionState } from '@/lib/runtime/action-runner';
import type { ArtifactState } from '@/lib/stores/workbench';

export interface IChatMetadata {
  gitUrl: string;
  gitBranch?: string;
}

// Artifact 快照接口
export interface ArtifactSnapshot {
  messageId: string;
  artifact: Omit<ArtifactState, 'runner'>; // 排除 runner 因为它包含不可序列化的函数
  actions: Record<string, Omit<ActionState, 'abort' | 'abortSignal'>>; // 排除不可序列化的属性
}

// 聊天历史项扩展
export interface ChatHistoryItem {
  id: string;
  messages: Message[];
  urlId?: string;
  description?: string;
  timestamp?: string;
  metadata?: IChatMetadata;
  artifactSnapshots?: ArtifactSnapshot[]; // 新增：Artifact 快照数组
} 