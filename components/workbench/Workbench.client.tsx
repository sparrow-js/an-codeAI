import { useStore } from '@nanostores/react';
import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import { computed } from 'nanostores';
import { memo, useCallback, useEffect, useState, ReactNode } from 'react';
import { toast } from 'react-toastify';
import {
  type OnChangeCallback as OnEditorChange,
  type OnScrollCallback as OnEditorScroll,
} from '@/components/editor/codemirror/CodeMirrorEditor';
import { IconButton } from '@/components/ui/IconButton';
import { PanelHeaderButton } from '@/components/ui/PanelHeaderButton';
import { Slider, type SliderOptions } from '@/components/ui/Slider';
import { workbenchStore, type WorkbenchViewType } from '@/lib/stores/workbench';
import { classNames } from '@/utils/classNames';
import { cubicEasingFn } from '@/utils/easings';
import { renderLogger } from '@/utils/logger';
import { EditorPanel } from './EditorPanel';
import { Preview } from './Preview';
import useViewport from '@/lib/hooks';
import { PushToGitHubDialog } from '@/components/@settings/tabs/connections/components/PushToGitHubDialog';
import { appId } from '@/lib/persistence/useChatHistory';
import { workspaceStore } from '@/lib/stores/workspace';
import { diffFiles } from '@/utils/diff';
import { filesToArtifacts } from '@/lib/fileUtils';
import type { Message } from 'ai';
import { Cloud, Code, Globe } from 'lucide-react';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadui/tabs"
import CloudDetail from './Cloud';

interface WorkspaceProps {
  chatStarted?: boolean;
  isStreaming?: boolean;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  setMessages?: (messages: any) => void;
  saveChat?: (messageId?: string, storeMessage?: boolean) => Promise<void>;
}

const viewTransition = { ease: cubicEasingFn };

const sliderOptions = {
  left: {
    value: 'code',
    text: 'Code',
  },
  right: {
    value: 'preview',
    text: 'Preview',
  },
};

const workbenchVariants = {
  closed: {
    width: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    width: 'var(--workbench-width)',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

export const Workbench = memo(({ chatStarted, isStreaming, sendMessage, setMessages, saveChat }: WorkspaceProps) => {
  renderLogger.trace('Workbench');

  const [isSyncing, setIsSyncing] = useState(false);
  const [isPushDialogOpen, setIsPushDialogOpen] = useState(false);

  const hasPreview = useStore(computed(workbenchStore.previews, (previews) => previews.length > 0));
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  const selectedFile = useStore(workbenchStore.selectedFile);
  const currentDocument = useStore(workbenchStore.currentDocument);
  const isFileSaving = useStore(workbenchStore.isFileSaving);
  const unsavedFiles = useStore(workbenchStore.unsavedFiles);
  const files = useStore(workbenchStore.files);
  const selectedView = useStore(workbenchStore.currentView);
  const currentWorkspace = useStore(workspaceStore.currentWorkspace);
  const previewDeploymentStatus = useStore(workbenchStore.previewDeploymentStatus);

  const isSmallViewport = useViewport(1024);

  const checkDeploymentStatus = async () => {
    const currentAppId = appId.get()?.replace('app-', '');
    if (!currentAppId) return;

    try {
      const projectName = `preview--${currentAppId}`;
      const response = await fetch(`/api/cloudflare-deployments-check?project_name=${projectName}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.status) {
          workbenchStore.previewDeploymentStatus.set(result.status);
        }
        if (result.status === 'success') {
          workbenchStore.reloadPreview();
        }
      }
    } catch (error) {
      console.error('Failed to check deployment status:', error);
    }
  };

  // Auto-check deployment status every 30 seconds when not success or failure
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;



    // Only start checking if status is not success or failure
    if (previewDeploymentStatus && 
        previewDeploymentStatus !== 'success' && 
        previewDeploymentStatus !== 'failure') {
      
      // Check immediately
      checkDeploymentStatus();
      
      // Then check every 30 seconds
      intervalId = setInterval(checkDeploymentStatus, 15000);
    }

    // Cleanup interval on dependency change or unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [previewDeploymentStatus]); // Re-run when status changes

  const setSelectedView = (view: string) => {
    workbenchStore.currentView.set(view as WorkbenchViewType);
  };

  useEffect(() => {
    if (hasPreview) {
      setSelectedView('preview');
    }
  }, [hasPreview]);

  useEffect(() => {
    workbenchStore.setDocuments(files);
  }, [files]);

  const onEditorChange = useCallback<OnEditorChange>((update) => {
    workbenchStore.setCurrentDocumentContent(update.content);
  }, []);

  const onEditorScroll = useCallback<OnEditorScroll>((position) => {
    workbenchStore.setCurrentDocumentScrollPosition(position);
  }, []);

  const onFileSelect = useCallback((filePath: string | undefined) => {
    workbenchStore.setSelectedFile(filePath);
  }, []);

  const onFileSave = useCallback(async () => {
    if (currentWorkspace?.plan === 'FREE') {
      toast.error('You are on a free plan. Can\'t save files');
      return;
    }

    try {
      // 获取当前文件信息
      if (!selectedFile || !currentDocument) {
        return;
      }

      const fileInfo = files[selectedFile];
      if (!fileInfo || fileInfo.type !== 'file') {
        return;
      }

      // 生成diff
      const diff = diffFiles(selectedFile.replace('/home/project/', ''), fileInfo.content, currentDocument.value);
      
      if (!diff) {
        // 文件没有变化
        toast.info('No changes to save');
        return;
      }

      // 创建文件列表
      const fileList = [{
        path: selectedFile.replace('/home/project/', ''),
        content: currentDocument.value
      }];

      // 生成diff内容
      const diffContent = `
${selectedFile.replace('/home/project/', '')}

--- a/${selectedFile.replace('/home/project/', '')}
+++ b/${selectedFile.replace('/home/project/', '')}
${diff}

`;

      // 生成用户更新的artifact
      const userUpdateArtifact = filesToArtifacts(fileList.reduce((acc: any, file: any) => {
        acc[`${file.path}`] = {
          content: file.content
        }
        return acc;
      }, {}), `${Date.now()}`);

      // 创建用户消息
      const userMessage: Message = {
        id: `${new Date().getTime()}`,
        role: 'user',
        content: `
User updated some files in the app, here's the diff:

${diffContent}

${userUpdateArtifact}
        `,
        annotations: ['manually_edited'],
      };

      // 保存文件
      await workbenchStore.saveCurrentDocument();

      // 更新消息状态
      if (setMessages) {
        setMessages((prev: any) => {
          return [...prev, userMessage];
        });
      }

      // 保存消息到聊天历史
      if (saveChat) {
        await saveChat('', true);
      }

      toast.success('File saved and message stored successfully');

    } catch (error) {
      console.error('Error saving file:', error);
      toast.error('Failed to update file content');
    }
  }, [selectedFile, currentDocument, files, setMessages, saveChat, currentWorkspace?.plan]);

  const onFileReset = useCallback(() => {
    workbenchStore.resetCurrentDocument();
  }, []);

  const handleSyncFiles = useCallback(async () => {
    setIsSyncing(true);

    try {
      const directoryHandle = await window.showDirectoryPicker();
      await workbenchStore.syncFiles(directoryHandle);
      toast.success('Files synced successfully');
    } catch (error) {
      console.error('Error syncing files:', error);
      toast.error('Failed to sync files');
    } finally {
      setIsSyncing(false);
    }
  }, []);


  

  return (
    chatStarted && (
      <motion.div
        initial="closed"
        animate={showWorkbench ? 'open' : 'closed'}
        variants={workbenchVariants}
        className="z-workbench"
      >
        <div
          className={classNames(
            'fixed top-[calc(var(--header-height)+1.5rem)] bottom-6 w-[var(--workbench-inner-width)] mr-4 z-0 transition-[left,width] duration-200 ease-bolt-cubic-bezier',
            {
              'w-full': isSmallViewport,
              'left-0': showWorkbench && isSmallViewport,
              'left-[var(--workbench-left)]': showWorkbench,
              'left-[100%]': !showWorkbench,
            },
          )}
        >
          <div className="absolute inset-0 px-2 lg:px-6">
            <div className="h-full flex flex-col bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor shadow-sm rounded-lg overflow-hidden">
              <div className="flex flex-row px-3 py-2 border-b border-bolt-elements-borderColor">
                <Tabs value={selectedView} onValueChange={setSelectedView}>
                  <TabsList>
                    <TabsTrigger value="code">
                      <Code className="w-4 h-4 mr-2" />
                      Code
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      <Globe className="w-4 h-4 mr-2" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="Cloud">
                      <Cloud className="w-4 h-4 mr-2" />
                      Cloud
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="ml-auto" />
                {selectedView === 'code' && (
                  <div className="flex overflow-y-auto">
                    <PanelHeaderButton
                      className="mr-1 text-sm"
                      onClick={() => {
                        if (currentWorkspace?.plan === 'FREE') {
                          toast.error('need upgrade to download code');
                          return;
                        }
                        workbenchStore.downloadZip();
                      }}
                    >
                      <div className="i-ph:code" />
                      Download Code
                    </PanelHeaderButton>
                    {/* <PanelHeaderButton className="mr-1 text-sm" onClick={handleSyncFiles} disabled={isSyncing}>
                      {isSyncing ? <div className="i-ph:spinner" /> : <div className="i-ph:cloud-arrow-down" />}
                      {isSyncing ? 'Syncing...' : 'Sync Files'}
                    </PanelHeaderButton> */}
                    {/* <PanelHeaderButton
                      className="mr-1 text-sm"
                      onClick={() => {
                        workbenchStore.toggleTerminal(!workbenchStore.showTerminal.get());
                      }}
                    >
                      <div className="i-ph:terminal" />
                      Toggle Terminal
                    </PanelHeaderButton> */}
                    {/* <PanelHeaderButton className="mr-1 text-sm" onClick={() => setIsPushDialogOpen(true)}>
                      <div className="i-ph:git-branch" />
                      Push to GitHub
                    </PanelHeaderButton> */}
                  </div>
                )}

                {
                  selectedView === 'preview' && previewDeploymentStatus !== 'success' && previewDeploymentStatus !== 'failure' && previewDeploymentStatus !== '' && (
                    <div className="ml-2 flex items-center gap-2 px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-sm border border-gray-200 dark:border-gray-700">
                        {previewDeploymentStatus === 'active' && (
                          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-1 py-0.5 transition-colors"
                            onClick={() => {
                              checkDeploymentStatus();
                            }}
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span> waiting for Deploying...</span>
                          </div>
                        )}
                        {previewDeploymentStatus === 'idle' && (
                          <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400 cursor-pointer hover:text-yellow-700 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded px-1 py-0.5 transition-colors"
                            onClick={() => {
                              checkDeploymentStatus();
                            }}
                          >
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>Waiting</span>
                          </div>
                        )}
                      {previewDeploymentStatus === 'failure' && (
                        <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Failed</span>
                        </div>
                      )}
                      {previewDeploymentStatus === 'canceled' && (
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                          <span>Canceled</span>
                        </div>
                      )}
                      {previewDeploymentStatus === 'no_deployments' && (
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                          <span>No deployments</span>
                        </div>
                      )}
                      {previewDeploymentStatus === 'success' && (
                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Success</span>
                        </div>
                      )}

                    </div>
                  )
                }
                <IconButton
                  icon="i-ph:x-circle"
                  className="-mr-1"
                  size="xl"
                  onClick={() => {
                    workbenchStore.showWorkbench.set(false);
                  }}
                />
              </div>
              <div className="relative flex-1 overflow-hidden">
                <View
                  initial={{ x: selectedView === 'code' ? 0 : '-100%' }}
                  animate={{ x: selectedView === 'code' ? 0 : '-100%' }}
                >
                  <EditorPanel
                    editorDocument={currentDocument}
                    isStreaming={isStreaming}
                    selectedFile={selectedFile}
                    files={files}
                    unsavedFiles={unsavedFiles}
                    onFileSelect={onFileSelect}
                    onEditorScroll={onEditorScroll}
                    onEditorChange={onEditorChange}
                    onFileSave={onFileSave}
                    onFileReset={onFileReset}
                    isFileSaving={isFileSaving}
                  />
                </View>
                <View
                  initial={{ x: selectedView === 'preview' ? 0 : '100%' }}
                  animate={{ x: selectedView === 'preview' ? 0 : '100%' }}
                >
                  <Preview sendMessage={sendMessage} />
                </View>
                <View
                  initial={{ x: selectedView === 'Cloud' ? 0 : '100%' }}
                  animate={{ x: selectedView === 'Cloud' ? 0 : '100%' }}
                >
                  <CloudDetail sendMessage={(msg) => sendMessage?.({} as React.UIEvent, msg)}/>
                </View>
              </div>
            </div>
          </div>
        </div>
        <PushToGitHubDialog
          isOpen={isPushDialogOpen}
          onClose={() => setIsPushDialogOpen(false)}
          onPush={async (repoName, username, token, isPrivate) => {
            try {
              const repoUrl = await workbenchStore.pushToGitHub(repoName, undefined, username, token, isPrivate);
              return repoUrl;
            } catch (error) {
              console.error('Error pushing to GitHub:', error);
              toast.error('Failed to push to GitHub');
              throw error; // Rethrow to let PushToGitHubDialog handle the error state
            }
          }}
        />
      </motion.div>
    )
  );
});

// View component for rendering content with motion transitions
interface ViewProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

const View = memo(({ children, ...props }: ViewProps) => {
  return (
    <motion.div className="absolute inset-0" transition={viewTransition} {...props}>
      {children}
    </motion.div>
  );
});
