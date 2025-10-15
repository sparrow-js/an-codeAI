'use client';

/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import type { JSONValue, Message } from 'ai';
import React, { type RefCallback, useEffect, useState } from 'react';
import { Workbench } from '@/components/workbench/Workbench.client';
import { classNames } from '@/utils/classNames';
import { Messages } from './Messages.client';
import { SendButton } from './SendButton.client';
import * as Tooltip from '@radix-ui/react-tooltip';

import styles from './BaseChat.module.scss';

import FilePreview from './FilePreview';
import type { ProviderInfo } from '@/types/model';
import { ScreenshotStateManager } from './ScreenshotStateManager';
import { toast } from 'react-toastify';
import type { ActionAlert } from '@/types/actions';
import ChatAlert from './ChatAlert';
import ProgressCompilation from './ProgressCompilation';
import type { ProgressAnnotation } from '@/types/context';
import { useSession } from "next-auth/react"
import { LoginModal } from '@/components/auth/LoginModal';
import { LocateFixed, ImageIcon } from 'lucide-react';
import { useVisualEditing } from '@/components/VisualEditor/hooks/useVisualEditing';
import { useCallback } from 'react';
import { ElementEditor } from '@/components/VisualEditor/ElementEditor/ElementEditor';
import  { generateAstFromFiles } from '@/lib/stores/ast';
import { getJSXElementCodeByLineAndFile } from '@/lib/ast-generation/ast-operations-code';
import { workbenchStore } from '@/lib/stores/workbench';
import { Button } from '@/components/shadui/button';
import { cn } from '@/lib/utils';
import { filesToArtifacts } from '@/lib/fileUtils';
import { workspaceStore } from '@/lib/stores/workspace';
import { chatId } from '@/lib/persistence/useChatHistory';


const TEXTAREA_MIN_HEIGHT = 76;

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  messages?: Message[];
  description?: string;
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  model?: string;
  setModel?: (model: string) => void;
  provider?: ProviderInfo;
  setProvider?: (provider: ProviderInfo) => void;
  providerList?: ProviderInfo[];
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
  importChat?: (description: string, messages: Message[]) => Promise<void>;
  exportChat?: () => void;
  uploadedFiles?: File[];
  setUploadedFiles?: (files: File[]) => void;
  imageDataList?: string[];
  setImageDataList?: (dataList: string[]) => void;
  actionAlert?: ActionAlert;
  clearAlert?: () => void;
  data?: JSONValue[] | undefined;
  saveChat?: (messageId?: string, storeMessage?: boolean) => Promise<void>;
  setMessages?: (messages: any) => void;
}

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      messageRef,
      scrollRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      model,
      setModel,
      provider,
      setProvider,
      providerList,
      input = '',
      enhancingPrompt,
      handleInputChange,

      enhancePrompt,
      sendMessage,
      handleStop,
      importChat,
      exportChat,
      uploadedFiles = [],
      setUploadedFiles,
      imageDataList = [],
      setImageDataList,
      messages,
      actionAlert,
      clearAlert,
      data,
      saveChat,
      setMessages,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
    const [transcript, setTranscript] = useState('');
    const [isModelLoading, setIsModelLoading] = useState<string | undefined>('all');
    const [progressAnnotations, setProgressAnnotations] = useState<ProgressAnnotation[]>([]);
    const [environmentData, setEnvironmentData] = useState<any[]>([]);
    const [loadingStates, setLoadingStates] = useState<boolean[]>([]);
    const { data: session } = useSession();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const {
      isPickAndEditActive,
      togglePickAndEdit,
      selectedElements,
      canEdit
  } = useVisualEditing();

  const [isDragActive, setIsDragActive] = useState(false);


    useEffect(() => {
      if (data) {
        const progressList = data.filter(
          (x) => typeof x === 'object' && (x as any).type === 'progress',
        ) as ProgressAnnotation[];
        setProgressAnnotations(progressList);
      }
    }, [data]);
    useEffect(() => {
      console.log(transcript);
    }, [transcript]);

    useEffect(() => {
      if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('');

          setTranscript(transcript);

          if (handleInputChange) {
            const syntheticEvent = {
              target: { value: transcript },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        setRecognition(recognition);
      }
    }, []);

    const startListening = () => {
      if (recognition) {
        recognition.start();
        setIsListening(true);
      }
    };

    const stopListening = () => {
      if (recognition) {
        recognition.stop();
        setIsListening(false);
      }
    };

    const handleSendMessage = (event: React.UIEvent, messageInput?: string) => {
      if (sendMessage) {
        sendMessage(event, messageInput);
        if (recognition) {
          recognition.abort(); // Stop current recognition
          setTranscript(''); // Clear transcript
          setIsListening(false);

          // Clear the input by triggering handleInputChange with empty value
          if (handleInputChange) {
            const syntheticEvent = {
              target: { value: '' },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
          }
        }
      }
    };

    const handleFileUpload = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];

        if (file) {
          if (file.size > 1000 * 1024) {
            toast.error('Image size cannot exceed 1000KB');
            return;
          }

          try {
               // Add file to state with loading
          const newIndex = uploadedFiles.length;
          setUploadedFiles && setUploadedFiles([...uploadedFiles, file]);
          debugger;
          setLoadingStates([...loadingStates, true]);
          
          const formData = new FormData();
          formData.append('file', file);
          // Upload file to server
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'content-type': file.type || 'application/octet-stream',
              'x-vercel-filename': encodeURIComponent(file.name || 'image.png'),
            },
            body: file,
          });

          if (!response.ok) {
            throw new Error('Upload failed');
          }

          const result = await response.json();
          console.log('Upload result:', result.url);

          // Update image data and loading state
          const newList = [...imageDataList];
          newList[newIndex] = result.url;
          setImageDataList?.(newList);

          setLoadingStates(prev => {
            const newStates = [...prev];
            newStates[newIndex] = false;
            return newStates;
          });
          } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload file');
            // Remove the file and its loading state on error
            setUploadedFiles && setUploadedFiles(uploadedFiles);
            setLoadingStates(loadingStates);
          }
        }
      };

      input.click();
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;

      if (!items) {
        return;
      }

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();

          const file = item.getAsFile();

          if (file) {
            setUploadedFiles?.([...uploadedFiles, file]);
            setLoadingStates([...loadingStates, true]);
            const reader = new FileReader();

            reader.onload = (e) => {
              const base64Image = e.target?.result as string;
              setImageDataList?.([...imageDataList, base64Image]);
              setLoadingStates(loadingStates.map((state, i) => i === loadingStates.length - 1 ? false : state));
            };
            reader.readAsDataURL(file);
          }

          break;
        }
      }
    };


    const handleTogglePickAndEdit = useCallback(() => {
      togglePickAndEdit();

  }, [togglePickAndEdit]);

    const selectedElement = selectedElements[0] || null;

    const checkCredits = async () => {
      const workspaceId = workspaceStore.getCurrentWorkspaceId();
      const credits = await fetch(`/api/usage/get-credits?workspaceId=${workspaceId}`);
      const creditsData = await credits.json();
      return creditsData.credits;
    }

    const checkStart = async () => {
      try {
        const currentChatId = chatId.get();
        if (!currentChatId) {
          console.error('No chat ID available');
          return null;
        }

        const response = await fetch(`/api/chats/${currentChatId}/checkstart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Checkstart result:', result);
        return result;
      } catch (error) {
        console.error('Failed to call checkstart API:', error);
        toast.error('Failed to check/start machine deployment');
        return null;
      }
    }

    const baseChat = (
      <>
      <div
        ref={ref}
        className={classNames(styles.BaseChat, 'relative flex w-full overflow-hidden')}
        data-chat-visible={showChat}
      >
        <div className="flex flex-col lg:flex-row overflow-y-auto w-full scrollbar-hide h-full">
          <div className={classNames(styles.Chat, 'flex flex-col flex-grow h-[calc(100vh-85px)] mt-[54px]')}>
            <div
              className={classNames('pt-2 scrollbar-hide', {
                'h-full flex flex-col pb-4 overflow-y-auto': chatStarted,
              })}
              ref={scrollRef}
            >
              {chatStarted ? (
                <div className="flex-1 w-full max-w-chat pb-6 mx-auto z-1">
                  <Messages
                    ref={messageRef}
                    className="flex flex-col "
                    messages={messages}
                    isStreaming={isStreaming}
                    saveChat={saveChat}
                  />
                </div>
              ) : null}
              <div
                className={classNames('flex flex-col gap-4 mx-auto z-prompt', {
                  'sticky bottom-2': chatStarted,
                  'position-absolute': chatStarted,
                  'w-full max-w-chat': chatStarted,
                  'w-[50%]': !chatStarted,
                })}
              >
                {actionAlert && (
                  <ChatAlert
                    alert={actionAlert}
                    clearAlert={() => clearAlert?.()}
                    postMessage={(message) => {
                      sendMessage?.({} as any, message);
                      clearAlert?.();
                    }}
                  />
                )}
                {progressAnnotations && <ProgressCompilation data={progressAnnotations} />}
                {isPickAndEditActive && (
                  <ElementEditor 
                      element={selectedElement}
                      disabled={!canEdit}
                      onClose={() => {
                        togglePickAndEdit();
                      }}
                      onSave={(updates) => {
                        // saveChat 现在会自动使用最新的消息数据
                        saveChat?.();
                      }}
                      onDiscard={() => {}}
                      sendMessage={sendMessage}
                      setMessages={setMessages}
                  />
          
                 
                )} 
                <div
                  className={classNames(
                    'bg-input relative z-10 mx-auto cursor-text overflow-hidden border pt-0.5 border-neutral-600 focus-within:border-neutral-300 dark:focus-within:border-neutral-700 pb-0.25 rounded-3xl shadow-sm mt-4 w-full transition-opacity sm:mt-2',

                    /*
                     * {
                     *   'sticky bottom-2': chatStarted,
                     * },
                     */
                  )}
                >
                  <svg className={classNames(styles.PromptEffectContainer)}>
                    <defs>
                      <linearGradient
                        id="line-gradient"
                        x1="20%"
                        y1="0%"
                        x2="-14%"
                        y2="10%"
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="rotate(-45)"
                      >
                        <stop offset="0%" stopColor="#b44aff" stopOpacity="0%"></stop>
                        <stop offset="40%" stopColor="#b44aff" stopOpacity="80%"></stop>
                        <stop offset="50%" stopColor="#b44aff" stopOpacity="80%"></stop>
                        <stop offset="100%" stopColor="#b44aff" stopOpacity="0%"></stop>
                      </linearGradient>
                      <linearGradient id="shine-gradient">
                        <stop offset="0%" stopColor="white" stopOpacity="0%"></stop>
                        <stop offset="40%" stopColor="#ffffff" stopOpacity="80%"></stop>
                        <stop offset="50%" stopColor="#ffffff" stopOpacity="80%"></stop>
                        <stop offset="100%" stopColor="white" stopOpacity="0%"></stop>
                      </linearGradient>
                    </defs>
                    <rect className={classNames(styles.PromptEffectLine)} pathLength="100" strokeLinecap="round"></rect>
                    <rect className={classNames(styles.PromptShine)} x="48" y="24" width="70" height="1"></rect>
                  </svg>
                  <FilePreview
                    files={uploadedFiles}
                    imageDataList={imageDataList}
                    loadingStates={loadingStates}
                    onRemove={(index) => {
                      setUploadedFiles?.(uploadedFiles.filter((_, i) => i !== index));
                      setImageDataList?.(imageDataList.filter((_, i) => i !== index));
                      setLoadingStates(loadingStates.filter((_, i) => i !== index));
                    }}
                  />
                  <ScreenshotStateManager
                      setUploadedFiles={setUploadedFiles}
                      setImageDataList={setImageDataList}
                      uploadedFiles={uploadedFiles}
                      imageDataList={imageDataList}
                    />
                  {isDragActive && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(30,30,30,0.6)',
                        zIndex: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        borderRadius: '1rem',
                      }}
                    >
                      <div style={{textAlign: 'center', color: '#fff'}}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{margin: '0 auto 16px', display: 'block'}}>
                          <path d="M12 15V3m0 0L8 7m4-4l4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 12v6a2 2 0 002 2h14a2 2 0 002-2v-6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <div style={{fontSize: '1rem', fontWeight: 500}}>Drag & drop an image here to upload</div>
                      </div>
                    </div>
                  )}  
                  <div
                    className={classNames(
                      'relative shadow-xs backdrop-blur rounded-lg',
                    )}
                  >
                    <textarea
                      ref={textareaRef}
                      className={classNames(
                        'w-full pl-4 pt-4 pr-16 outline-none resize-none text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent text-sm',
                        'transition-all duration-200',
                        'hover:border-bolt-elements-focus',
                      )}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setIsDragActive(true);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragActive(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragActive(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragActive(false);

                        const files = Array.from(e.dataTransfer.files);
                        files.forEach(async (file, fileIndex) => {
                          if (file.type.startsWith('image/')) {
                            try {
                              setUploadedFiles && setUploadedFiles([...uploadedFiles, file]);
                              setLoadingStates && setLoadingStates([...loadingStates, true]);
                              
                              const formData = new FormData();
                              formData.append('file', file);
                              
                              // Upload file to server
                              const response = await fetch('/api/upload', {
                                method: 'POST',
                                headers: {
                                  'content-type': file.type || 'application/octet-stream',
                                  'x-vercel-filename': encodeURIComponent(file.name || 'image.png'),
                                },
                                body: file,
                              });

                              if (!response.ok) {
                                throw new Error('Upload failed');
                              }

                              const result = await response.json();
                              console.log('Upload result:', result.url);

                              // Update image data and loading state
                              const newList = [...imageDataList];
                              newList[fileIndex] = result.url;
                              setImageDataList?.(newList);

                              setLoadingStates(prev => {
                                const newStates = [...prev];
                                const currentIndex = prev.length - 1;
                                newStates[currentIndex] = false;
                                return newStates;
                              });
                            } catch (error) {
                              console.error('Upload error:', error);
                              toast.error('Failed to upload file');
                              // Remove file and loading state on error
                              setUploadedFiles?.(uploadedFiles.filter((_, i) => i !== uploadedFiles.length - 1));
                              setLoadingStates(loadingStates.filter((_, i) => i !== uploadedFiles.length - 1));
                            }
                          }
                        });
                      }}
                      onKeyDown={async (event) => {
                        if (event.key === 'Enter') {
                          if (event.shiftKey) {
                            return;
                          }

                          event.preventDefault();

                          // Prevent multiple rapid Enter presses
                          if (isButtonDisabled) return;
                          setIsButtonDisabled(true);

                          try {
                            if(!session) {
                              setShowLoginModal(true);
                              return;
                            }

                            if (isStreaming) {
                              handleStop?.();
                              return;
                            }

                            // ignore if using input method engine
                            if (event.nativeEvent.isComposing) {
                              return;
                            }

                            const credits = await checkCredits();

                            if (credits <= 0) {
                              toast.error('No credits left');
                              return;
                            }


                            if (selectedElements.length > 0) {
                              const element = selectedElements[0];

                              const fileInfo = workbenchStore.files.get()[`/home/project/${element.filePath}`];
                              if (fileInfo && fileInfo.type === 'file') {
                                const ast = generateAstFromFiles([[element.filePath, fileInfo.content]])
                                const codeContent = getJSXElementCodeByLineAndFile(element.lineNumber, element.filePath, ast);
                                if (input.length > 0 || uploadedFiles.length > 0) {
                                  //
                                  const userUpdateArtifact = filesToArtifacts( {
                                    [`/home/project/${element.filePath}`]: {
                                      content: codeContent || ''
                                    }
                                  }, `${Date.now()}`);
                                  togglePickAndEdit();

                                  handleSendMessage?.(event, `
User has selected an element to edit, here's the element's code position: file: ${element.filePath}, line number: ${element.lineNumber} the relevant code is - ${codeContent}
\n\n${userUpdateArtifact}
Only modify the selected element, User's needs : ${input}
                                    `);
                                }
                              }                  
                              return;
                            }

                            handleSendMessage?.(event);
                          } finally {
                            // Re-enable after 1 second
                            setTimeout(() => setIsButtonDisabled(false), 1000);
                          }
                        }
                      }}
                      value={input}
                      onChange={(event) => {
                        handleInputChange?.(event);
                      }}
                      onPaste={handlePaste}
                      style={{
                        minHeight: TEXTAREA_MIN_HEIGHT,
                        maxHeight: TEXTAREA_MAX_HEIGHT,
                      }}
                      placeholder="How can needware help you today?"
                      translate="no"
                    />
                      <SendButton
                          show={input.length > 0 || isStreaming || uploadedFiles.length > 0}
                          isStreaming={isStreaming}
                          disabled={!providerList || providerList.length === 0 || isButtonDisabled}
                          onClick={async (event) => {
                            // Prevent multiple rapid clicks
                            if (isButtonDisabled) return;
                            setIsButtonDisabled(true);
                            
                            try {
                              if(!session) {
                                setShowLoginModal(true);
                                return;
                              }

                              if (isStreaming) {
                                handleStop?.();
                                return;
                              }

                              const credits = await checkCredits();

                              if (credits <= 0) {
                                toast.error('No credits left');
                                return;
                              }
                              
                              if (selectedElements.length > 0) {
                                const element = selectedElements[0];

                                const fileInfo = workbenchStore.files.get()[`/home/project/${element.filePath}`];
                                if (fileInfo && fileInfo.type === 'file') {
                                  const ast = generateAstFromFiles([[element.filePath, fileInfo.content]])
                                  const codeContent = getJSXElementCodeByLineAndFile(element.lineNumber, element.filePath, ast);
                                  if (input.length > 0 || uploadedFiles.length > 0) {
                                    //
                                    const userUpdateArtifact = filesToArtifacts( {
                                      [`/home/project/${element.filePath}`]: {
                                        content: codeContent || ''
                                      }
                                    }, `${Date.now()}`);

                                    togglePickAndEdit();
                                    handleSendMessage?.(event, `
  User has selected an element to edit, here's the element's code position: file: ${element.filePath}, line number: ${element.lineNumber} the relevant code is - ${codeContent}
  \n\n${userUpdateArtifact}
  User's needs : ${input}
                                      `);
                                  }

                                  
                                }                  
                                return;
                              }

                              if (input.length > 0 || uploadedFiles.length > 0) {
                                handleSendMessage?.(event);
                              }
                            } finally {
                              // Re-enable the button after 1 second
                              setTimeout(() => setIsButtonDisabled(false), 1000);
                            }
                          }}
                        />
                    <div className="flex justify-between items-center text-sm p-4 pt-2">
                      <div className="flex gap-1 items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          title="Upload file" 
                          className="h-7 w-7"
                          onClick={() => handleFileUpload()}
                        >
                          <ImageIcon className="w-4 h-4" />
                        </Button>

                        {
                          chatStarted && (
                            <Button
                              size={'sm'}
                              variant="outline"
                              className={cn(
                                'px-1.5 py-1 h-7',
                                isPickAndEditActive ? '!bg-yellow-500' : ''
                              )}
                              onClick={async () => {
                                if (workbenchStore.environment.get() !== 'created') {
                                  checkStart();
                                }
                                handleTogglePickAndEdit();
                              }}
                            >
                              <LocateFixed className="w-4 h-4" />
                              <span>Edit</span>
                            </Button>
                          )
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Workbench chatStarted={chatStarted} isStreaming={isStreaming} sendMessage={sendMessage} setMessages={setMessages} saveChat={saveChat}/>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
       
      </div>
      </>
    );

    return <Tooltip.Provider delayDuration={200}>{baseChat}</Tooltip.Provider>;
  },
);
