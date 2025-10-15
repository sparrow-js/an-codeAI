import { useEffect, useState, useRef } from 'react';
import { useStore } from '@nanostores/react';
import useViewport from '@/lib/hooks';
import { chatStore } from '@/lib/stores/chat';
import { workbenchStore } from '@/lib/stores/workbench';
import { classNames } from '@/utils/classNames';
import { Button } from '@/components/shadui/button';
import { Input } from '@/components/shadui/input';
import { appId } from '@/lib/persistence/useChatHistory';
import { supabase } from '@/lib/supabase';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadui/popover"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/shadui/collapsible"
import { chatId } from '@/lib/persistence';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Rocket, ChevronDown, Plus, Edit2, Check, Info } from "lucide-react"
import { toast } from 'react-toastify';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadui/tooltip"

interface HeaderActionButtonsProps {}

export function HeaderActionButtons({}: HeaderActionButtonsProps) {
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  const { showChat } = useStore(chatStore);

  const { id } = useParams();

  const isSmallViewport = useViewport(1024);

  const canHideChat = showWorkbench || !showChat;

  const [clientId] = useState<string>(appId.get()?.replace('app-', '') || "");
  const [isDeploying, setIsDeploying] = useState(false);

  const [deployStatus, setDeployStatus] = useState<string>('');

  const [deployInfo, setDeployInfo] = useState<any>({});
  
  const shortUrl = useStore(workbenchStore.shortUrl);
  const [isEditingUrl, setIsEditingUrl] = useState<boolean>(false);
  const [websiteInfoOpen, setWebsiteInfoOpen] = useState<boolean>(false);
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(false);
  const [isSavingUrl, setIsSavingUrl] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  
  // Ref for the editing container to handle outside clicks
  const editingContainerRef = useRef<HTMLDivElement>(null);

  // 订阅特定客户端的频道
  useEffect(() => {
    if (!id) {
      return;
    }
    const clientId = id.toString().replace('app-', '');
    const channel = supabase
      .channel(`private:${clientId}`)
      .on('broadcast', { event: 'message' }, (payload: { payload: any }) => {
        if (payload.payload.type === 'redeploy') {
          workbenchStore.environment.set(payload.payload.status);
        } else if (payload.payload.type === 'install') {
          workbenchStore.installDependenciesStatus.set(payload.payload.status);
        } else {
          setDeployStatus(payload.payload.status);
        }
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [id]);

  // Update website URL when deploy info changes
  useEffect(() => {
    if (deployInfo.url) {
      workbenchStore.shortUrl.set(deployInfo.url.replace('https://', '').replace('http://', ''));
    }
  }, [deployInfo.url]);

  // Listen for global editing state changes to exit edit mode when other components start editing
  // NOTE: Currently only used by this component, but kept for future extensibility
  useEffect(() => {
    const unsubscribe = workbenchStore.globalEditingState.subscribe((editingState) => {
      if (editingState && editingState.type !== 'shortUrl' && isEditingUrl) {
        setIsEditingUrl(false);
      }
    });

    return unsubscribe;
  }, [isEditingUrl]);

  // Handle click outside to exit edit mode
  useEffect(() => {
    if (!isEditingUrl) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (editingContainerRef.current && !editingContainerRef.current.contains(event.target as Node)) {
        setIsEditingUrl(false);
        workbenchStore.globalEditingState.set(null);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isEditingUrl) {
        setIsEditingUrl(false);
        workbenchStore.globalEditingState.set(null);
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isEditingUrl]);

  return (
    <div className="flex">
      <div className="flex border border-bolt-elements-borderColor rounded-md overflow-hidden">
        <Popover>
          <PopoverTrigger asChild>
          <Button 
              onClick={async () => {
                const res = await fetch(`/api/get-deploy-info/${chatId.get()}`);

                const data = await res.json();
                setDeployInfo(data);

                setDeployStatus(data.status);
              }}
              size={'sm'}
              className="relative flex items-center justify-center" style={{backgroundColor: '#f38020', color: '#fff'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6730d'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f38020'}
            >
              <Rocket size={16} /> Deploy
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 text-white border border-dark-600/30 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-dark-700/85 via-dark-800 to-dark-700/85">
            <div className="space-y-6 p-6">
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-xl text-white">
                    Publish 
                  </h4>
                  {
                    (deployStatus === 'completed' || deployStatus === 'success') && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-green-500 text-white">
                        Live
                      </span>
                    )
                  }
                </div>
                {
                  deployStatus === 'init' || deployStatus === 'no' && (
                    <p className="text-sm leading-relaxed text-dark-300">
                      Make your project live.
                    </p>
                  )
                }
      
              </div>

              {/* Website Address Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h5 className="font-semibold text-white">Website Address</h5>
                    <div className="relative">
                      <Info 
                        size={16} 
                        className="text-gray-400 hover:text-gray-300 cursor-pointer transition-colors" 
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      />
                      {showTooltip && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-gray-800 bg-white border border-gray-200 rounded shadow-lg whitespace-nowrap z-50">
                          First deployment may take a moment to become accessible
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                        </div>
                      )}
                    </div>
                </div>
                <div className="relative">
                  {isEditingUrl ? (
                    <div className="relative" ref={editingContainerRef}>
                      <div className="flex items-center bg-dark-900/80 border-2 border-dark-500 rounded-lg px-4 py-3 shadow-lg shadow-dark-500/20 transition-all duration-200">
                        <input
                          value={shortUrl || ''}
                          onChange={(e) => workbenchStore.shortUrl.set(e.target.value)}
                          className="flex-1 bg-transparent text-white placeholder-dark-400 outline-none font-mono text-base min-w-0"
                          placeholder="7cf1010e"
                          autoFocus
                        />
                        <span className="text-dark-300 font-mono text-base ml-2 whitespace-nowrap">
                          .needware.dev
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-4 h-auto p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-md transition-all duration-200"
                          disabled={isSavingUrl}
                          onClick={async () => {
                            try {
                              setIsSavingUrl(true);
                              const response = await fetch(`/api/chats/${chatId.get()}/update-shorturl`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ shortId: shortUrl }),
                              });

                              if (!response.ok) {
                                const errorText = await response.text();
                                toast.error(`Failed to update website address: ${errorText}`);
                              } else {
                                toast.success('Website address updated successfully');
                                setIsEditingUrl(false);
                                workbenchStore.globalEditingState.set(null);
                              }
                            
                            } catch (error) {
                              console.error('Failed to update short URL:', error);
                            } finally {
                              setIsSavingUrl(false);
                            }
                          }}
                        >
                          {isSavingUrl ? (
                            <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check size={18} />
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="group flex items-center rounded-lg px-4 py-3 transition-all duration-200 bg-dark-700/40 border border-dark-600/60 hover:bg-dark-600/60 hover:border-dark-500/80">
                      <a 
                        href={`https://${shortUrl}.needware.dev`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex min-w-0 flex-1 items-center h-fit transition-colors duration-200 hover:bg-dark-600/20 rounded-md px-2 py-1 -mx-2 -my-1"
                      >
                        <span className="min-w-0 flex-1 truncate text-left">
                          <span className="font-normal text-dark-100 group-hover:text-white transition-colors duration-200">
                            {shortUrl}
                          </span>
                          <span className="text-dark-300 group-hover:text-dark-200 transition-colors duration-200">
                            .needware.dev
                          </span>
                        </span>
                      </a>
                      {
                        deployStatus === 'init' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors duration-100 ease-in-out h-auto p-2 rounded-md text-dark-300 hover:text-white hover:bg-dark-600/50"
                            onClick={() => {
                              // Cancel any other editing states
                              workbenchStore.globalEditingState.set({ type: 'shortUrl' });
                              if (deployStatus === 'init') {
                                setIsEditingUrl(true);
                              }
                            }}
                          >
                            <Edit2 size={14} />
                          </Button>
                        )
                      }
                
                    </div>
                  )}
                </div>
              </div>

              {/* Publish Button */}
              <Button 
                className="w-full text-white font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:via-green-600 hover:to-green-700 border border-green-400/30" 
                onClick={async () => {
                  setIsDeploying(true);
                  if (deployStatus === 'pending') {
                    return;
                  }
                  setDeployStatus('pending');

                  const res = await fetch('/api/deploy-to-cloudflare', {
                    method: 'POST',
                    body: JSON.stringify({ 
                      repo: `wordixai/repo-${chatId.get()}`,
                      projectName: chatId.get(),
                      appId: chatId.get()
                    }),
                  });

                  const data = await res.json();
                  setDeployStatus(data.status);
                  setDeployInfo(data);
                }}
                disabled={!deployStatus || deployStatus === 'pending'}
              >
                {!deployStatus ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-lg">Loading...</span>
                  </div>
                ) : deployStatus === 'pending' ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-lg">Publishing...</span>
                  </div>
                ) : deployStatus === 'completed' || deployStatus === 'success' ? (
                  <div className="flex items-center gap-2">
                    <Rocket size={18} className="text-white" />
                    <span className="text-lg">Update</span>
                  </div>
                ) : deployStatus === 'init' || deployStatus === 'no' ? (
                  <div className="flex items-center gap-2">
                    <Rocket size={18} className="text-white" />
                    <span className="text-lg">Publish</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Rocket size={18} className="text-white" />
                    <span className="text-lg">Publish</span>
                  </div>
                )}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}