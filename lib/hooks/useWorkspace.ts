import { useStore } from '@nanostores/react';
import { useCallback } from 'react';
import { workspaceStore } from '@/lib/stores/workspace';
import type { UserWorkspace } from '@/utils/workspace';

export function useWorkspace() {
  const currentWorkspace = useStore(workspaceStore.currentWorkspace);
  const workspaces = useStore(workspaceStore.workspaces);
  const loading = useStore(workspaceStore.loading);
  const error = useStore(workspaceStore.error);
  const initialized = useStore(workspaceStore.initialized);

  const fetchWorkspace = useCallback(async () => {
    await workspaceStore.fetchWorkspace();
  }, []);

  const setCurrentWorkspace = useCallback((workspace: UserWorkspace) => {
    workspaceStore.setCurrentWorkspace(workspace);
  }, []);

  const switchToWorkspace = useCallback((workspaceId: string) => {
    return workspaceStore.switchToWorkspace(workspaceId);
  }, []);

  const getCurrentWorkspaceId = useCallback(() => {
    return workspaceStore.getCurrentWorkspaceId();
  }, []);

  const reset = useCallback(() => {
    workspaceStore.reset();
  }, []);

  return {
    // 状态
    currentWorkspace,
    workspaces,
    loading,
    error,
    initialized,
    
    // 方法
    fetchWorkspace,
    setCurrentWorkspace,
    switchToWorkspace,
    getCurrentWorkspaceId,
    reset,
  };
} 