import { atom, type WritableAtom } from 'nanostores';
import { workspaceStore } from './workspace';

export interface HistoryState {
  id: string;
  userId: string;
  urlId: string;
  description: string;
  timestamp: string;
  previewImageUrl: string;
  metadata: {
    streamStatus: string;
  }
}

export type HistoryUpdateState = Pick<HistoryState, 'description'>;

export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export class HistoryStore {
  histories: WritableAtom<HistoryState[]> = atom<HistoryState[]>([]);
  loading: WritableAtom<boolean> = atom<boolean>(false);
  pagination: WritableAtom<PaginationInfo | null> = atom<PaginationInfo | null>(null);
  currentPage: WritableAtom<number> = atom<number>(1);

  constructor() {}

  addHistory({ id, description }: Omit<HistoryState, 'timestamp'>) {
    const currentHistories = this.histories.get();
    if (currentHistories.some(history => history.id === id)) {
      return;
    }

    this.histories.set([
      ...currentHistories,
      {
        id,
        description,
        timestamp: new Date().toISOString(),
        userId: '',
        urlId: '',
        previewImageUrl: '',
        metadata: {
          streamStatus: 'completed'
        }
      }
    ]);
  }

  updateHistory({ id }: { id: string }, state: Partial<HistoryUpdateState>) {
    const currentHistories = this.histories.get();
    const historyIndex = currentHistories.findIndex(history => history.id === id);
    
    if (historyIndex === -1) {
      return;
    }

    const updatedHistories = [...currentHistories];
    updatedHistories[historyIndex] = {
      ...updatedHistories[historyIndex],
      ...state
    };

    this.histories.set(updatedHistories);
  }

  getHistory(id: string) {
    const histories = this.histories.get();
    return histories.find(history => history.id === id);
  }

  resetHistories() {
    this.histories.set([]);
    this.pagination.set(null);
    this.currentPage.set(1);
  }

  async getHistories(page: number = 1, limit: number = 8, append: boolean = false) {
    // 获取当前的 workspaceId
    const workspaceId = workspaceStore.getCurrentWorkspaceId();
    
    this.loading.set(true);
    
    try {
      const response = await fetch(`/api/chats?workspaceId=${workspaceId}&page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch chats');
      
      const result = await response.json();
      
      if (result.data && result.pagination) {
        if (append && page > 1) {
          // 追加模式：将新数据添加到现有数据后面
          const currentHistories = this.histories.get();
          const newHistories = [...currentHistories, ...result.data];
          this.histories.set(newHistories);
        } else {
          // 重置模式：替换现有数据
          this.histories.set(result.data);
        }
        
        this.pagination.set(result.pagination);
        this.currentPage.set(page);
      } else {
        // 兼容旧格式（非分页数据）
        this.histories.set(result);
        this.pagination.set(null);
        this.currentPage.set(1);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to load histories:', error);
      // 发生错误时也不清空现有历史记录
      return this.histories.get();
    } finally {
      this.loading.set(false);
    }
  }

  async loadMoreHistories() {
    const currentPagination = this.pagination.get();
    if (!currentPagination || !currentPagination.hasNextPage) {
      return false;
    }

    const nextPage = currentPagination.nextPage;
    if (!nextPage) return false;

    try {
      // 使用append模式加载更多数据
      const result = await this.getHistories(nextPage, currentPagination.limit, true);
      return result;
    } catch (error) {
      console.error('Failed to load more histories:', error);
      return false;
    }
  }

  async deleteHistory(id: string) {
    try {
      const response = await fetch(`/api/chats/${id}/delete`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to delete chat');

      const histories = this.histories.get();
      this.histories.set(histories.filter(history => history.id !== id));
      return true;
    } catch (error) {
      console.error('Failed to delete history:', error);
      return false;
    }
  }
}

export const historyStore = new HistoryStore();