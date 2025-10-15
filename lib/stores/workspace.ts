import { atom, type WritableAtom } from 'nanostores';
import type { UserWorkspace } from '@/utils/workspace';

export interface WorkspaceState {
  currentWorkspace: UserWorkspace | null;
  workspaces: UserWorkspace[];
  loading: boolean;
  error: string | null;
}

export class WorkspaceStore {
  // 状态管理
  currentWorkspace: WritableAtom<UserWorkspace | null> = atom(null);
  workspaces: WritableAtom<UserWorkspace[]> = atom([]);
  loading: WritableAtom<boolean> = atom(false);
  error: WritableAtom<string | null> = atom(null);
  initialized: WritableAtom<boolean> = atom(false);

  constructor() {
    // 不在构造函数中自动初始化，等待用户登录后手动触发
  }

  /**
   * 获取用户的 workspace 信息
   */
  async fetchWorkspace(): Promise<void> {
    // 如果已经初始化过，直接返回
    if (this.initialized.get()) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await fetch('/api/workspace');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch workspaces');
      }

      // 设置 workspace 列表
      if (data.workspaces && data.workspaces.length > 0) {
        this.workspaces.set(data.workspaces);
        
        // 处理当前 workspace 选择
        const storedWorkspaceId = localStorage.getItem('current-workspace-id');
        let currentWorkspace: UserWorkspace | null = null;
        
        if (storedWorkspaceId) {
          // 查找存储的 workspace ID
          currentWorkspace = data.workspaces.find((w: UserWorkspace) => w.id === storedWorkspaceId) || null;
        }
        
        // 如果没有找到存储的 workspace 或者没有存储的 ID，使用第一个
        if (!currentWorkspace && data.workspaces.length > 0) {
          currentWorkspace = data.workspaces[0];
        }
        
        if (currentWorkspace) {
          this.currentWorkspace.set(currentWorkspace);
          localStorage.setItem('current-workspace-id', currentWorkspace.id);
        }
      }
      
      // 标记为已初始化
      this.initialized.set(true);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      this.error.set(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * 设置当前 workspace
   */
  setCurrentWorkspace(workspace: UserWorkspace): void {
    this.currentWorkspace.set(workspace);
    if (typeof window !== 'undefined') {
      localStorage.setItem('current-workspace-id', workspace.id);
    }
  }

  /**
   * 通过 ID 切换到指定的 workspace
   */
  switchToWorkspace(workspaceId: string): boolean {
    const workspaces = this.workspaces.get();
    const targetWorkspace = workspaces.find(w => w.id === workspaceId);
    
    if (targetWorkspace) {
      this.setCurrentWorkspace(targetWorkspace);
      return true;
    }
    
    console.warn(`Workspace with ID ${workspaceId} not found`);
    return false;
  }

  /**
   * 获取当前 workspace ID
   */
  getCurrentWorkspaceId(): string | null {
    const current = this.currentWorkspace.get() ;
    return current?.id || localStorage.getItem('current-workspace-id') || null;
  }



  /**
   * 重置状态
   */
  reset(): void {
    this.currentWorkspace.set(null);
    this.workspaces.set([]);
    this.loading.set(false);
    this.error.set(null);
    this.initialized.set(false);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current-workspace-id');
    }
  }
}

export const workspaceStore = new WorkspaceStore(); 