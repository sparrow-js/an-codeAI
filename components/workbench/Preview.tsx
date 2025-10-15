import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { IconButton } from '@/components/ui/IconButton';
import { workbenchStore } from '@/lib/stores/workbench';
import { PortDropdown } from './PortDropdown';
import { ScreenshotSelector } from './ScreenshotSelector';
import { appId } from '@/lib/persistence/useChatHistory';
import { Progress } from "@/components/ui/Progress-ui";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { RotateCcw, MonitorSpeaker, SquareArrowOutUpRight, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/shadui/button';
import { useToast } from '@/hooks/use-toast';

// 检测用户是否偏好减少动画的 Hook
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};


type ResizeSide = 'left' | 'right' | null;

interface WindowSize {
  name: string;
  width: number;
  height: number;
  icon: string;
}

const WINDOW_SIZES: WindowSize[] = [
  { name: 'Mobile', width: 375, height: 667, icon: 'i-ph:device-mobile' },
  { name: 'Tablet', width: 768, height: 1024, icon: 'i-ph:device-tablet' },
  { name: 'Laptop', width: 1366, height: 768, icon: 'i-ph:laptop' },
  { name: 'Desktop', width: 1920, height: 1080, icon: 'i-ph:monitor' },
];

interface PreviewProps {
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
}

export const Preview = memo(({ sendMessage }: PreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isPortDropdownOpen, setIsPortDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPreviewOnly, setIsPreviewOnly] = useState(false);
  const hasSelectedPreview = useRef(false);
  const previews = useStore(workbenchStore.previews);
  const activePreview = previews[activePreviewIndex];
  const environment = useStore(workbenchStore.environment);
  const installDependenciesStatus = useStore(workbenchStore.installDependenciesStatus);
  const previewDeploymentStatus = useStore(workbenchStore.previewDeploymentStatus);
  const { toast } = useToast();

  const [url, setUrl] = useState('');
  const [iframeUrl, setIframeUrl] = useState<string | undefined>();
  const [isPreviewLinkLoading, setIsPreviewLinkLoading] = useState(false);
  
  // Function to extract path from URL for display
  const getDisplayUrl = useCallback((fullUrl: string) => {
    if (!activePreview?.baseUrl) return fullUrl;
    
    try {
      const baseUrl = new URL(activePreview.baseUrl);
      const currentUrl = new URL(fullUrl);
      
      // If it's the same origin, return only the path + search + hash
      if (baseUrl.origin === currentUrl.origin) {
        return currentUrl.pathname + currentUrl.search + currentUrl.hash;
      }
    } catch (e) {
      // If URL parsing fails, fallback to string manipulation
      if (fullUrl.startsWith(activePreview.baseUrl)) {
        const pathPart = fullUrl.substring(activePreview.baseUrl.length);
        return pathPart || '/';
      }
    }
    
    return fullUrl;
  }, [activePreview]);

  useEffect(() => {
    if (installDependenciesStatus === 'completed') {
      setTimeout(() => {
        reloadPreview();
      }, 1000);
    }
  }, [installDependenciesStatus]);
  
  // Function to convert display URL back to full URL
  const getFullUrl = useCallback((displayUrl: string) => {
    if (!activePreview?.baseUrl) return displayUrl;
    
    // If it starts with /, it's a path - prepend base URL
    if (displayUrl.startsWith('/') || displayUrl.startsWith('?') || displayUrl.startsWith('#')) {
      return activePreview.baseUrl + displayUrl;
    }
    
    // If it's already a full URL, return as is
    return displayUrl;
  }, [activePreview]);

  // Get router list from workbench store
  const routerList = useStore(workbenchStore.routerList);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredRoutes, setFilteredRoutes] = useState<typeof routerList>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Toggle between responsive mode and device mode
  const [isDeviceModeOn, setIsDeviceModeOn] = useState(false);

  // Use percentage for width
  const [widthPercent, setWidthPercent] = useState<number>(37.5);

  const [isError, setIsError] = useState(false);
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  const [isErrorLogsOpen, setIsErrorLogsOpen] = useState(false);

  // 检测用户动画偏好
  const prefersReducedMotion = useReducedMotion();

  // 根据用户偏好创建动画配置
  const getAnimationConfig = (baseConfig: any) => {
    if (prefersReducedMotion) {
      return {
        ...baseConfig,
        animate: undefined,
        initial: undefined,
        transition: { duration: 0 }
      };
    }
    return baseConfig;
  };

  const resizingState = useRef({
    isResizing: false,
    side: null as ResizeSide,
    startX: 0,
    startWidthPercent: 37.5,
    windowWidth: window.innerWidth,
  });

  const SCALING_FACTOR = 2;

  const [isWindowSizeDropdownOpen, setIsWindowSizeDropdownOpen] = useState(false);
  const [selectedWindowSize, setSelectedWindowSize] = useState<WindowSize>(WINDOW_SIZES[0]);

  useEffect(() => {
    if (!activePreview) {
      setUrl('');
      setIframeUrl(undefined);
      return;
    }

    const { baseUrl } = activePreview;
    setUrl(getDisplayUrl(baseUrl));
    setIframeUrl(baseUrl);
  }, [activePreview, getDisplayUrl]);

  useEffect(() => {
    if (environment === 'created') {
      workbenchStore.previews.set([{
        port: 3000,
        ready: true,
        baseUrl: `https://${appId.get()?.replace('app-', '')}.fly.dev/`,
        isLoading: true,
        loadingProgress: 0
      }]);
    }
  }, [environment]);

  // Handle input focus to update and filter routes
  const handleInputFocus = useCallback(() => {
    const routes = workbenchStore.setRouterList();
    const filtered = routes.filter(route => route.path !== '*');
    setFilteredRoutes(filtered);
    setIsDropdownOpen(true);
  }, []);

  // Handle input blur to close dropdown
  const handleInputBlur = useCallback((event: React.FocusEvent) => {
    // Delay closing to allow clicking on dropdown items
    setTimeout(() => {
      if (event.currentTarget && !event.currentTarget.contains(document.activeElement)) {
        setIsDropdownOpen(false);
      }
    }, 150);
  }, []);

  // Close dropdown when clicking outside
  const addressBarRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      if (addressBarRef.current && !addressBarRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const validateUrl = useCallback(
    (value: string) => {
      if (!activePreview) {
        return false;
      }

      const { baseUrl } = activePreview;
      const fullUrl = getFullUrl(value);

      if (fullUrl === baseUrl) {
        return true;
      } else if (fullUrl.startsWith(baseUrl)) {
        return ['/', '?', '#'].includes(fullUrl.charAt(baseUrl.length));
      }

      return false;
    },
    [activePreview, getFullUrl],
  );

  const findMinPortIndex = useCallback(
    (minIndex: number, preview: any, index: number, array: any[]) => {
      return (preview.port ?? Infinity) < (array[minIndex].port ?? Infinity) ? index : minIndex;
    },
    [],
  );

  useEffect(() => {
    if (previews.length > 1 && !hasSelectedPreview.current) {
      const minPortIndex = previews.reduce(findMinPortIndex, 0);
      setActivePreviewIndex(minPortIndex);
    }
  }, [previews, findMinPortIndex]);

  useEffect(() => {
    const messageHandler = (e: any) => {
      if (e.data?.error) {
        setIsError(true);
        if(Array.isArray(e.data.error)){
          setErrorLogs([e.data.error[0].stack || e.data.error[0].message || e.data.error[0]]);
        } else {
          setErrorLogs(e.data.error.message ? [e.data.error.message, e.data.error.stack|| ''] : e.data.error);

        }
      }
    }
    window.addEventListener('message', messageHandler);
    return () => {
      window.removeEventListener('message', messageHandler);
    }
  }, [])

  // 创建一个共享的启动进度条函数
  const startProgressAnimation = useCallback(() => {
    console.log('starting progress animation');
    workbenchStore.setLoadingState(true, 0);
    
    const progressInterval = setInterval(() => {
      const currentPreviews = workbenchStore.previews.get();
      if (currentPreviews.length === 0) return;
      
      const currentProgress = currentPreviews[0]?.loadingProgress || 0;
      
      if (currentProgress >= 90) {
        clearInterval(progressInterval);
        return;
      }
      
      workbenchStore.updateLoadingProgress(currentProgress + Math.random() * 10);
    }, 100);
    
    return progressInterval;
  }, []);

  const reloadPreview = () => {
    if (iframeRef.current) {
      // 启动进度条动画
      const progressInterval = startProgressAnimation();
      
      // 设置一个事件处理器来清理进度条
      const handleReloadComplete = () => {
        console.log('reload complete');
        clearInterval(progressInterval);
        workbenchStore.setLoadingState(false, 100);
        iframeRef.current?.removeEventListener('load', handleReloadComplete);
      };
      
      // 添加一次性加载事件监听器
      iframeRef.current.addEventListener('load', handleReloadComplete, { once: true });
      
      // 重新加载iframe
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const toggleFullscreen = async () => {
    if (!isFullscreen && containerRef.current) {
      await containerRef.current.requestFullscreen();
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleDeviceMode = () => {
    setIsDeviceModeOn((prev) => !prev);
  };

  const startResizing = (e: React.MouseEvent, side: ResizeSide) => {
    if (!isDeviceModeOn) {
      return;
    }

    document.body.style.userSelect = 'none';

    resizingState.current.isResizing = true;
    resizingState.current.side = side;
    resizingState.current.startX = e.clientX;
    resizingState.current.startWidthPercent = widthPercent;
    resizingState.current.windowWidth = window.innerWidth;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    e.preventDefault();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!resizingState.current.isResizing) {
      return;
    }

    const dx = e.clientX - resizingState.current.startX;
    const windowWidth = resizingState.current.windowWidth;

    const dxPercent = (dx / windowWidth) * 100 * SCALING_FACTOR;

    let newWidthPercent = resizingState.current.startWidthPercent;

    if (resizingState.current.side === 'right') {
      newWidthPercent = resizingState.current.startWidthPercent + dxPercent;
    } else if (resizingState.current.side === 'left') {
      newWidthPercent = resizingState.current.startWidthPercent - dxPercent;
    }

    newWidthPercent = Math.max(10, Math.min(newWidthPercent, 90));

    setWidthPercent(newWidthPercent);
  };

  const onMouseUp = () => {
    resizingState.current.isResizing = false;
    resizingState.current.side = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    document.body.style.userSelect = '';
  };

  useEffect(() => {
    const handleWindowResize = () => {
      // Optional: Adjust widthPercent if necessary
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const GripIcon = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          color: 'rgba(0,0,0,0.5)',
          fontSize: '10px',
          lineHeight: '5px',
          userSelect: 'none',
          marginLeft: '1px',
        }}
      >
        ••• •••
      </div>
    </div>
  );

  const openInNewWindow = (size: WindowSize) => {
    if (activePreview?.baseUrl) {

      const previewUrl = activePreview?.baseUrl;
      const newWindow = window.open(
        previewUrl,
        '_blank',
        `noopener,noreferrer,width=${size.width},height=${size.height},menubar=no,toolbar=no,location=no,status=no`,
      );

      if (newWindow) {
        newWindow.focus();
      }
    }
  };

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
          return result.status;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to check deployment status:', error);
      return null;
    }
  };

  const handlePreviewLinkClick = async () => {
    const currentAppId = appId.get()?.replace('app-', '');

    try {
      const previewUrl = `https://preview--${currentAppId}.pages.dev/`;
      if (previewDeploymentStatus === 'success') {
        // 部署成功，直接跳转
        window.open(previewUrl, '_blank');    
      } else {
        setIsPreviewLinkLoading(true);
        // 直接显示部署状态
        const status = await checkDeploymentStatus();
        if (status === 'completed' || status === 'success') {
          window.open(previewUrl, '_blank');
        } else {
          const toastInstance = toast({
            title: "Deployment Status",
            description: status || 'unknown',
            variant: status === 'failure' || status === 'error' ? "destructive" : "default",
          });
          
          // 2秒后自动关闭
          setTimeout(() => {
            toastInstance.dismiss();
          }, 2000);
        }
      }
    } finally {
      setIsPreviewLinkLoading(false);
    }
  };

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    let progressInterval: NodeJS.Timeout;

    const handleLoad = () => {
      console.log('iframe loaded');
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      workbenchStore.setLoadingState(false, 100);
    };

    // 清理之前可能存在的事件监听器
    iframe.removeEventListener('load', handleLoad);
    
    // 添加新的事件监听器
    iframe.addEventListener('load', handleLoad);
    
    // 开始加载动画
    progressInterval = startProgressAnimation();

    return () => {
      iframe.removeEventListener('load', handleLoad);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [iframeUrl, startProgressAnimation]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex flex-col relative ${isPreviewOnly ? 'fixed inset-0 z-50 bg-white' : ''}`}
    >
      {isPortDropdownOpen && (
        <div className="z-iframe-overlay w-full h-full absolute" onClick={() => setIsPortDropdownOpen(false)} />
      )}

      {!workbenchStore.isFirstDeploy.get() && (
        <div className="bg-bolt-elements-background-depth-2 p-2 flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2">
            <Button id="reload-preview" variant="outline" size="icon" className='w-7 h-7' onClick={reloadPreview}>
              <RotateCcw className='w-5 h-5'/>
            </Button>
          </div>
          
          <div className='flex items-center justify-center max-w-[420px] w-full'>
            <div ref={addressBarRef} className="address-bar-container relative flex-grow">
              <div className="flex items-center gap-1 bg-bolt-elements-preview-addressBar-background border border-bolt-elements-borderColor text-bolt-elements-preview-addressBar-text rounded-full px-3 py-1 text-sm hover:bg-bolt-elements-preview-addressBar-backgroundHover hover:focus-within:bg-bolt-elements-preview-addressBar-backgroundActive focus-within:bg-bolt-elements-preview-addressBar-backgroundActive focus-within-border-bolt-elements-borderColorActive focus-within:text-bolt-elements-preview-addressBar-textActive">
                <input
                  title="URL"
                  ref={inputRef}
                  className="w-full bg-transparent outline-none"
                  type="text"
                  value={url}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onChange={(event) => {
                    setUrl(event.target.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && validateUrl(url)) {
                      setIframeUrl(getFullUrl(url));
                      setIsDropdownOpen(false);

                      if (inputRef.current) {
                        inputRef.current.blur();
                      }
                    } else if (event.key === 'Escape') {
                      setIsDropdownOpen(false);
                      if (inputRef.current) {
                        inputRef.current.blur();
                      }
                    }
                  }}
                />
              </div>
              
              {/* Custom dropdown */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#363635] rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {filteredRoutes.map((route, index) => {
                    // Check if this route is currently selected
                    let isCurrentRoute = false;
                    if (activePreview?.baseUrl) {
                      const baseUrl = activePreview.baseUrl.endsWith('/') 
                        ? activePreview.baseUrl.slice(0, -1) 
                        : activePreview.baseUrl;
                      const routePath = route.path.startsWith('/') 
                        ? route.path 
                        : '/' + route.path;
                      const fullUrl = baseUrl + routePath;
                      isCurrentRoute = url === route.path || url === getDisplayUrl(fullUrl);
                    }
                    
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (activePreview?.baseUrl) {
                            // Properly join baseUrl and route.path to avoid double slashes
                            const baseUrl = activePreview.baseUrl.endsWith('/') 
                              ? activePreview.baseUrl.slice(0, -1) 
                              : activePreview.baseUrl;
                            const routePath = route.path.startsWith('/') 
                              ? route.path 
                              : '/' + route.path;
                            const fullUrl = baseUrl + routePath;
                            setUrl(getDisplayUrl(fullUrl));
                            setIframeUrl(fullUrl);
                            setIsDropdownOpen(false);
                          }
                        }}
                        className={`flex items-center px-3 py-2 cursor-pointer hover:bg-[#4a4a49] dark:hover:bg-[#4a4a49] text-sm ${
                          isCurrentRoute ? 'bg-[#454544] dark:bg-[#454544]' : ''
                        }`}
                      >
                        <div className="flex flex-col flex-1">
                          <span className={`${isCurrentRoute ? 'font-medium text-white dark:text-white' : 'text-white dark:text-white'}`}>
                            {route.path}
                          </span>
                          {route.element && (
                            <span className={`text-xs ${
                              isCurrentRoute ? 'text-gray-200 dark:text-gray-200' : 'text-gray-300 dark:text-gray-300'
                            }`}>
                              {route.element}
                            </span>
                          )}
                        </div>
                        {isCurrentRoute && (
                          <div className="w-2 h-2 rounded-full bg-white ml-2 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                  {filteredRoutes.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-300 dark:text-gray-300">
                      No routes found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
     

          <div className="flex items-center gap-2">
            {previews.length > 1 && (
              <PortDropdown
                activePreviewIndex={activePreviewIndex}
                setActivePreviewIndex={setActivePreviewIndex}
                isDropdownOpen={isPortDropdownOpen}
                setHasSelectedPreview={(value) => (hasSelectedPreview.current = value)}
                setIsDropdownOpen={setIsPortDropdownOpen}
                previews={previews}
              />
            )}
            <Button variant="outline" size="icon" className='w-7 h-7' onClick={toggleDeviceMode}>
              <MonitorSpeaker className='w-5 h-5'/>
            </Button>

            <div className="flex items-center relative">
              <Button 
                variant="outline" 
                size="icon" 
                className='w-7 h-7' 
                onClick={handlePreviewLinkClick}
                disabled={isPreviewLinkLoading}
              >
                {isPreviewLinkLoading ? (
                  <Loader2 className='w-5 h-5 animate-spin' />
                ) : (
                  <SquareArrowOutUpRight className='w-5 h-5' />
                )}
              </Button>

              {isWindowSizeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setIsWindowSizeDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 min-w-[240px] bg-white dark:bg-black rounded-xl shadow-2xl border border-[#E5E7EB] dark:border-[rgba(255,255,255,0.1)] overflow-hidden">
                    {WINDOW_SIZES.map((size) => (
                      <button
                        key={size.name}
                        className="w-full px-4 py-3.5 text-left text-[#111827] dark:text-gray-300 text-sm whitespace-nowrap flex items-center gap-3 group hover:bg-[#F5EEFF] dark:hover:bg-gray-900 bg-white dark:bg-black"
                        onClick={() => {
                          setSelectedWindowSize(size);
                          setIsWindowSizeDropdownOpen(false);
                          openInNewWindow(size);
                        }}
                      >
                        <div
                          className={`${size.icon} w-5 h-5 text-[#6B7280] dark:text-gray-400 group-hover:text-[#6D28D9] dark:group-hover:text-[#6D28D9] transition-colors duration-200`}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium group-hover:text-[#6D28D9] dark:group-hover:text-[#6D28D9] transition-colors duration-200">
                            {size.name}
                          </span>
                          <span className="text-xs text-[#6B7280] dark:text-gray-400 group-hover:text-[#6D28D9] dark:group-hover:text-[#6D28D9] transition-colors duration-200">
                            {size.width} × {size.height}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      <div className="flex-1 border-t border-bolt-elements-borderColor flex justify-center items-center overflow-auto">
        <div
          style={{
            width: isDeviceModeOn ? `${widthPercent}%` : '100%',
            height: '100%',
            overflow: 'visible',
            background: 'var(--bolt-elements-background-depth-1)',
            position: 'relative',
            display: 'flex',
          }}
        >
          {activePreview?.isLoading && (
            <div className="absolute top-0 left-0 right-0 z-10">
              <Progress value={activePreview.loadingProgress} className="rounded-none" />
            </div>
          )}

          {/* Starting live preview indicator */}
          {environment === 'starting' && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
              <div className="flex items-center gap-3 px-6 py-4 bg-black bg-opacity-90 rounded-xl text-white shadow-lg w-80 h-16 justify-center">
                <span className="text-sm font-medium">Starting live preview...</span>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {/* Installing dependencies indicator */}
          {installDependenciesStatus === 'installing' && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
              <div className="flex items-center gap-3 px-6 py-4 bg-black bg-opacity-90 rounded-xl text-white shadow-lg w-80 h-16 justify-center">
                <span className="text-sm font-medium">Installing dependencies...</span>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}
         
          {workbenchStore.isFirstDeploy.get() && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-bolt-elements-background-depth-2 px-4">
              <div className="max-w-md w-full flex flex-col items-center">
                <div className="mb-12 relative flex items-center justify-center">
                  {/* 背景光环 - 恰到好处的光辉效果 */}
                  <motion.div
                    className="absolute w-30 h-30 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.15) 50%, transparent 80%)',
                    }}
                    {...getAnimationConfig({
                      animate: {
                        scale: [0.9, 1.18, 0.9],
                        opacity: [0.25, 0.45, 0.25],
                      },
                      transition: {
                        duration: 3.6,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        repeat: Infinity,
                        repeatType: "loop"
                      }
                    })}
                  />
                  
                  {/* Logo容器 - 温和的浮动效果 */}
                  <motion.div
                    className="relative z-10 flex items-center justify-center"
                    {...getAnimationConfig({
                      animate: {
                        y: [0, -4, 2, -1, 0], // 适中的位移
                        rotate: [0, 0.8, -0.8, 0.4, 0], // 轻微旋转
                      },
                      transition: {
                        duration: 5.5,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        times: [0, 0.25, 0.5, 0.75, 1],
                        repeat: Infinity,
                        repeatType: "loop"
                      }
                    })}
                  >
                    <motion.img 
                      src="/logo.png" 
                      alt="needware Logo" 
                      className="w-16 h-16"
                      {...getAnimationConfig({
                        animate: {
                          scale: [1, 1.04, 0.96, 1.02, 1], // 适中的脉动
                        },
                        transition: {
                          duration: 4.5,
                          ease: [0.25, 0.46, 0.45, 0.94],
                          times: [0, 0.25, 0.5, 0.75, 1],
                          repeat: Infinity,
                          repeatType: "loop",
                          delay: 1
                        }
                      })}
                    />
                  </motion.div>
                </div>
                
                <div className="mb-16">
                  <motion.h2 
                    className="text-gray-300 font-light tracking-wide text-lg text-center"
                    {...getAnimationConfig({
                      initial: { opacity: 0, y: 15, scale: 0.95 },
                      animate: { opacity: 1, y: 0, scale: 1 },
                      transition: {
                        duration: 1.2,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        delay: 0.8
                      }
                    })}
                  >
                    Your preview will appear here
                  </motion.h2>
                </div>
              </div>
            </div>
           )}

          {activePreview && !workbenchStore.isFirstDeploy.get() && (
            <>
              <iframe
                ref={iframeRef}
                id="preview"
                title="preview"
                key={iframeUrl}
                className="border-none w-full h-full bg-bolt-elements-background-depth-1"
                src={iframeUrl || `https://${appId.get()?.replace('app-', '')}.fly.dev/`}
                sandbox="allow-scripts allow-forms allow-popups allow-modals allow-storage-access-by-user-activation allow-same-origin"
                allow="cross-origin-isolated"
              />
              <ScreenshotSelector
                isSelectionMode={isSelectionMode}
                setIsSelectionMode={setIsSelectionMode}
                containerRef={iframeRef as unknown as React.RefObject<HTMLElement>}
              />
            </>
          )}

          {isDeviceModeOn && (
            <>
              <div
                onMouseDown={(e) => startResizing(e, 'left')}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '15px',
                  marginLeft: '-15px',
                  height: '100%',
                  cursor: 'ew-resize',
                  background: 'rgba(255,255,255,.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  userSelect: 'none',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.5)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.2)')}
                title="Drag to resize width"
              >
                <GripIcon />
              </div>

              <div
                onMouseDown={(e) => startResizing(e, 'right')}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '15px',
                  marginRight: '-15px',
                  height: '100%',
                  cursor: 'ew-resize',
                  background: 'rgba(255,255,255,.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  userSelect: 'none',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.5)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.2)')}
                title="Drag to resize width"
              >
                <GripIcon />
              </div>
            </>
          )}

          {isError && installDependenciesStatus !== 'installing' && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[rgba(23,23,23,0.95)] rounded-xl gap-6 shadow-lg text-sm">
              <div className="flex items-center p-4 relative">
                {/* Close Button */}
                <button
                  onClick={() => setIsError(false)}
                  className="absolute top-2 right-2 text-white hover:text-gray-300 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>

                <div className="flex flex-col gap-1">
                  <div className="text-amber-400 flex items-start">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L1 21h22L12 2zm0 3.45l8.27 14.32H3.73L12 5.45zm-1.5 4.5v6h3v-6h-3zm0 7.5v3h3v-3h-3z"/>
                    </svg>
                    <div className="text-white font-medium leading-5 ml-2">Error</div>
                  </div>

                  {/* Error Message */}
                  <div className="flex flex-col gap-1">
                    <div className="text-gray-300 text-sm">
                      Oops, it looks like our AI had a bit of a hiccup and broke the app
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 p-2">
                  <button 
                    type="button"
                    onClick={() => {
                      workbenchStore.genType.set('fix-error');
                      sendMessage?.({} as any, `*Fix this preview error* \n\`\`\`js \n${errorLogs.join('\n')}\n\`\`\`\n`);
                      setIsError(false);
                      workbenchStore.forceRefreshPreview.set(true);
                  }}
                    className="px-3 py-1.5 bg-white text-black rounded-lg flex items-center gap-2 w-[120px] place-content-between text-sm hover:bg-gray-100 transition-colors"
                  >
                    Try to fix
                    <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">F</kbd>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setIsErrorLogsOpen(!isErrorLogsOpen);
                    }}
                    className="px-3 py-1.5 bg-[rgba(255,255,255,0.1)] text-white rounded-lg flex items-center gap-2 w-[120px] place-content-between text-sm hover:bg-[rgba(255,255,255,0.2)] transition-colors"
                  >
                    Show logs
                    <kbd className="bg-[rgba(255,255,255,0.1)] px-1.5 py-0.5 rounded text-xs">L</kbd>
                  </button>
                </div>
              </div>
              {isErrorLogsOpen && (
              <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto text-xs text-red-500 p-4">
                {errorLogs.map((log) => (
                  <div key={log}>{log}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
