'use client';
import { useCallback, useEffect, useState, RefObject } from "react";
import ProjectCard from "./ProjectCard";
import ProjectCardSkeleton from "./ProjectCardSkeleton";
import { ChatHistoryItem } from "@/lib/persistence";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/shadui/dialog';
import { Button } from '@/components/shadui/button';
import { historyStore } from "@/lib/stores/historys";
import { useStore } from '@nanostores/react';
import { useWorkspace } from '@/lib/hooks/useWorkspace';

interface Project {
  id: string;
  title: string;
  category: string;
  remixes: number;
  author: string;
  authorImage?: string;
  image: string;
}

interface UserSectionProps {
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
}

type DialogContent = { type: 'delete'; item: any } | null;


const UserSection = ({ textareaRef }: UserSectionProps) => {
  const [dialogContent, setDialogContent] = useState<DialogContent>(null);
  const [editNameDialog, setEditNameDialog] = useState<{ isOpen: boolean; item?: any }>({ isOpen: false });
  const [newProjectName, setNewProjectName] = useState("");
  const [dataInitialized, setDataInitialized] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const histories = useStore(historyStore.histories);
  const loading = useStore(historyStore.loading);
  const pagination = useStore(historyStore.pagination);
  const currentPage = useStore(historyStore.currentPage);
  const { initialized } = useWorkspace();

  const loadEntries = useCallback(async () => {
    try {
      await historyStore.getHistories(1, 8);
      setDataInitialized(true);
    } catch (error) {
      toast.error('Failed to load chats');
      setDataInitialized(true);
    }
  }, []);

  const loadMoreEntries = useCallback(async () => {
    if (!pagination?.hasNextPage || loadingMore) return;
    
    setLoadingMore(true);
    try {
      await historyStore.loadMoreHistories();
    } catch (error) {
      toast.error('Failed to load more chats');
    } finally {
      setLoadingMore(false);
    }
  }, [pagination?.hasNextPage, loadingMore]);

  const deleteItem = useCallback(async (event: React.UIEvent, item: ChatHistoryItem) => {
    event.preventDefault();

    try {
      await historyStore.deleteHistory(item.id);
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
  }, [loadEntries]);

  useEffect(() => {
    // 只有当 workspace 初始化完成时才加载历史记录
    if (initialized) {
      loadEntries();
    }
  }, [initialized, loadEntries]);

  // 判断是否应该显示初始加载状态
  const shouldShowInitialLoading = !dataInitialized || (loading && histories.length === 0);

  const closeDialog = () => {
    setDialogContent(null);
  };

  const closeEditNameDialog = () => {
    setEditNameDialog({ isOpen: false });
    setNewProjectName("");
  };

  const handleDeleteClick = (event: React.UIEvent, item: ChatHistoryItem) => {
    setDialogContent({ type: 'delete', item });
  };

  const handleRenameClick = (event: React.UIEvent, item: any) => {
    setEditNameDialog({ isOpen: true, item });
    setNewProjectName(item.description || "");
  };

  const handleRenameProject = async () => {
    if (!editNameDialog.item || !newProjectName.trim()) return;
    try {

      const response = await fetch(`/api/chats/${editNameDialog.item.id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: newProjectName.trim()  }),
      });

      if (!response.ok) {
        throw new Error('Failed to update description');
      }

      await loadEntries();
      closeEditNameDialog();
      toast.success('Project renamed successfully');
    } catch (error) {
      toast.error('Failed to rename project');
    }
  };

  return (
    <div className="flex w-full flex-col gap-12 rounded-[20px] bg-bolt-elements-background-depth-3 px-8">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2 sm:gap-4">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex w-full items-center">
              <p className="text-2xl font-medium text-gray-700 dark:text-gray-300">My Workspace</p>
            </div>
          </div>
        </div>
        
        {shouldShowInitialLoading ? (
          // 初始加载状态UI - 使用Skeleton，只在没有数据时显示
          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
          </div>
        ) : histories.length === 0 ? (
          // 空状态UI
          <div 
            className="flex flex-col items-center justify-center py-12 px-4 cursor-pointer transition-all duration-200 rounded-xl group"
            onClick={() => {
              if (textareaRef?.current) {
                textareaRef.current.focus();
                textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/30 rounded-2xl flex items-center justify-center shadow-sm border border-yellow-200/60 dark:border-yellow-700/50 transition-all duration-200 group-hover:scale-105 group-hover:border-yellow-300 dark:group-hover:border-yellow-600 group-hover:shadow-md">
                <svg
                  className="w-9 h-9 text-yellow-600 dark:text-yellow-400 transition-colors duration-200 group-hover:text-yellow-700 dark:group-hover:text-yellow-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-sm border border-yellow-200/60 dark:border-yellow-700/50 transition-all duration-200 group-hover:border-yellow-300 dark:group-hover:border-yellow-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse group-hover:bg-yellow-600 transition-colors duration-200"></div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
              Ready to create?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm leading-relaxed text-sm transition-colors duration-200">
              Your workspace is waiting for your first project. Start building something amazing!
            </p>
          </div>
        ) : (
          // 有数据时显示项目列表
          <>
            <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {histories.map((project: any) => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  onDelete={(event) => handleDeleteClick(event, project)}
                  onRename={(event) => handleRenameClick(event, project)}
                />
              ))}
            </div>
            
            {/* 加载更多时的骨架屏 - 显示在现有内容下方 */}
            {loadingMore && (
              <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4 mt-6">
                {Array.from({ length: 8 }, (_, index) => (
                  <ProjectCardSkeleton key={`loading-more-${index}`} />
                ))}
              </div>
            )}
            
            {/* 分页信息显示 */}
            {pagination && (
              <div className="flex flex-col items-center gap-4 mt-4">
                {/* 加载更多按钮 */}
                {pagination.hasNextPage && (
                  <div className="flex justify-center mt-3">
                    <button 
                      className="px-4 py-2 bg-[#4a4a4a] text-[#e6d96a] rounded-md hover:bg-[#555555] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={loadMoreEntries}
                      disabled={loadingMore}
                    >
                      {loadingMore ? 'Loading...' : `Load More (${pagination.totalCount - histories.length} remaining)`}
                    </button>
                  </div>
                )}
                
                {/* 没有更多内容时显示 */}
                {!pagination.hasNextPage && pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-3">
                    <button className="px-4 py-2 bg-[#4a4a4a] text-[#e6d96a] rounded-md opacity-50 cursor-not-allowed font-medium">
                      All projects loaded
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
       

        {/* Dialogs moved outside conditional rendering to prevent issues */}
        <Dialog open={dialogContent !== null} onOpenChange={closeDialog}>
          <DialogContent>
            {dialogContent?.type === 'delete' && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">Delete Chat?</DialogTitle>
                  <DialogDescription className="mt-2 text-gray-600 dark:text-gray-400">
                      You are about to delete{' '}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {dialogContent.item.description}
                      </span>
                      <span className="mt-2"> Are you sure you want to delete this chat?</span>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button
                      variant="destructive"
                      onClick={async (event: React.MouseEvent) => {
                        closeDialog();
                        await deleteItem(event, dialogContent.item);
                        await loadEntries();
                      }}
                    >
                    Delete
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={editNameDialog.isOpen} onOpenChange={closeEditNameDialog}>
          <DialogContent>
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Rename project
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 mb-6">
                  Give your project a new name.
                </DialogDescription>
              </DialogHeader>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="my-awesome-project"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Use lowercase letters, numbers, and hyphens only.
                  <br />
                  Example: my-awesome-project
                </p>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={closeEditNameDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handleRenameProject}
                  disabled={!newProjectName.trim()}
                >
                  Rename Project
                </Button>
              </DialogFooter>
            </>
          </DialogContent>
        </Dialog>

       
      </div>
    </div>
  );
};

export default UserSection;
