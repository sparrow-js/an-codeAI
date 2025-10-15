"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { classNames } from '@/utils/classNames';
import styles from '@/components/chat/BaseChat.module.scss';
import FilePreview from "@/components/chat/FilePreview";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { LoginModal } from "@/components/auth/LoginModal";
import UserSection from "@/components/works-display/UserSection";
import Footer from "@/components/footer";
import { ImageIcon } from "lucide-react";
import { SendButton } from '@/components/chat/SendButton.client';
import { Button } from "@/components/shadui/button";
import { workspaceStore } from '@/lib/stores/workspace';
import CommunitySection from "@/components/works-display/CommunitySection";
import { ProductsGrid } from "@/components/products-grid";
import { Header } from "@/components/header/Header";

const TEXTAREA_MIN_HEIGHT = 90;
const TEXTAREA_MAX_HEIGHT = 200;

const usePrefetchRoute = (baseRoute: string) => {
  const router = useRouter();
  
  useEffect(() => {
    let cancelled = false;
    const poll = () => {
      if (!cancelled) {
        router.prefetch(baseRoute);
        // Re-prefetch after a delay
        setTimeout(poll, 5000);
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [baseRoute, router]);

  return useCallback((id: string) => {
    // Replace the ID in the baseRoute with the new ID
    const baseWithoutLastPart = baseRoute.split('/').slice(0, -1).join('/');
    const route = `${baseWithoutLastPart}/${id}`;
    return router.push(route);
  }, [baseRoute, router]);
};

export default function HomePage() {
  const navigateToChat = usePrefetchRoute('/chat/f453e3a6-34b2-467e-86fb-6fa18763ea90');
  const [input, setInput] = useState("");
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [imageDataList, setImageDataList] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState<boolean[]>([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const { data: session } = useSession();
  const [isDragActive, setIsDragActive] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);



  const handleSendMessage = async (event: React.UIEvent) => {

    const workspaceId = workspaceStore.getCurrentWorkspaceId();
    const res = await fetch('/api/chats', {
      method: 'POST',
      body: JSON.stringify({
        messages: [
          {
            id: `${new Date().getTime()}`,
            role: 'user',
            content: [
              {
                type: 'text',
                text: `${input}`,
              },
              ...imageDataList.map((imageData) => ({
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              })),
            ] as any,
          },
        ],
        workspaceId: workspaceId,
        description: '',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      await navigateToChat(data.id);
      setIsStreaming(false);
    } else {
      const errorData = await res.json();
      toast.error(errorData.error || 'Failed to send message. Please try again.');
      setIsStreaming(false);
    }
  }

  const checkCredits = async (workspaceId: string) => {
    const credits = await fetch(`/api/usage/get-credits?workspaceId=${workspaceId}`);
    const creditsData = await credits.json();
    return creditsData.credits;
  }

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];

      if (file) {
        // Check file size (500KB limit)
        if (file.size > 1000 * 1024) {
          toast.error('Image size cannot exceed 1000KB');
          return;
        }

        try {
          // Add file to state with loading
          const newIndex = uploadedFiles.length;
          setUploadedFiles([...uploadedFiles, file]);
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
          setImageDataList(prev => {
            const newList = [...prev];
            newList[newIndex] = result.url;
            return newList;
          });
          setLoadingStates(prev => {
            const newStates = [...prev];
            newStates[newIndex] = false;
            return newStates;
          });

        } catch (error) {
          console.error('Upload error:', error);
          toast.error('Failed to upload file');
          // Remove file and loading state on error
          setUploadedFiles(prev => prev.filter((_, i) => i !== uploadedFiles.length));
          setLoadingStates(prev => prev.filter((_, i) => i !== loadingStates.length));
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
          const reader = new FileReader();

          reader.onload = (e) => {
            const base64Image = e.target?.result as string;
            setUploadedFiles?.([...uploadedFiles, file]);
            setImageDataList?.([...imageDataList, base64Image]);
          };
          reader.readAsDataURL(file);
        }

        break;
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  }



  return (
    <>
    <Header />
    <div className="flex flex-col lg:flex-row w-full scrollbar-hide h-full mt-[54px]">
      <div
        className={classNames(styles.BaseChat, 'relative flex w-full overflow-hidden')}
      >
        <div className="flex flex-col lg:flex-row w-full scrollbar-hide h-full">
          <div className={classNames(styles.Chat, 'flex flex-col flex-grow mb-36')}>
              <div 
                id="intro" 
                className="mt-[16vh] mx-auto text-center px-4 lg:px-0 relative"
                style={{
                  backgroundImage: 'url(/cloud.png)',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center top',
                  backgroundRepeat: 'no-repeat',
                  padding: '4rem 1rem',
                  borderRadius: '1rem',
                  minHeight: '300px'
                }}
              >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent mb-4 animate-fade-in mt-24">
                  What would you build today?
                </h1>
                <p className="text-xl lg:text-xl mb-8 text-bolt-elements-textSecondary animate-fade-in animation-delay-200">
                Create your own apps & websites by chatting with AI
                </p>
              </div>
            <div
              className={classNames('pt-6 scrollbar-hide max-w-3xl mx-auto w-full')}
            >
                <div
                  className={classNames(
                    'bg-input relative z-10 mx-auto cursor-text overflow-hidden border border-neutral-600 focus-within:border-neutral-300 dark:focus-within:border-neutral-700 pb-0.25 rounded-3xl shadow-sm mt-4 w-full transition-opacity sm:mt-2',
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
                  <div>
                
                  </div>
                  <FilePreview
                    files={uploadedFiles}
                    imageDataList={imageDataList}
                    loadingStates={loadingStates}
                    onRemove={(index) => {
                      setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
                      setImageDataList(imageDataList.filter((_, i) => i !== index));
                      setLoadingStates(loadingStates.filter((_, i) => i !== index));
                    }}
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
                      'relative shadow-xs backdrop-blur rounded-lg pt-4',
                    )}
                  >
                    <textarea
                      ref={textareaRef}
                      className={classNames(
                        'w-full pl-4 pr-16 outline-none resize-none text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent text-[16px]',
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
                              setUploadedFiles(prev => [...prev, file]);
                              setLoadingStates(prev => [...prev, true]);
                              
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
                              setImageDataList(prev => {
                                const newList = [...prev];
                                const currentIndex = prev.length;
                                newList[currentIndex] = result.url;
                                return newList;
                              });
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
                              setUploadedFiles(prev => prev.filter((_, i) => i !== prev.length - 1));
                              setLoadingStates(prev => prev.filter((_, i) => i !== prev.length - 1));
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

                            // ignore if using input method engine
                            if (event.nativeEvent.isComposing) {
                              return;
                            }

                            const workspaceId = workspaceStore.getCurrentWorkspaceId();
                            if (!workspaceId) {
                              toast.error('No workspace selected');
                              return;
                            }
                            
                            setIsStreaming(true);

                            const credits = await checkCredits(workspaceId);

                            if (credits <= 0) {
                              toast.error('No credits left');
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
                          disabled={isButtonDisabled}
                          onClick={async (event) => {
                            // Prevent multiple rapid clicks
                            if (isButtonDisabled) return;
                            setIsButtonDisabled(true);
                            
                            try {
                              if(!session) {
                                setShowLoginModal(true);
                                return;
                              }

                              const workspaceId = workspaceStore.getCurrentWorkspaceId();
                              if (!workspaceId) {
                                toast.error('No workspace selected');
                                return;
                              }

                              setIsStreaming(true);
                              
                              const credits = await checkCredits(workspaceId);

                              if (credits <= 0) {
                                toast.error('No credits left');
                                setIsStreaming(false);
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
    
        </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
    
    <div className={classNames("gap-5", {
      'hidden': chatStarted,
    })}>
      <div className="m-10">
        <div className="flex w-full flex-col gap-4 rounded-[20px] bg-bolt-elements-background-depth-3 py-8">
          {session?.user && (
            <UserSection textareaRef={textareaRef} />
          )}
          <div className="mt-4">
            <CommunitySection />
          </div>
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
}
