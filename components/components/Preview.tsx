import { useEffect, useRef, useState } from 'react';
import classNames from "classnames";
import useThrottle from "../hooks/useThrottle";
import { AppState } from "../types";
import {
  FaBug
} from "react-icons/fa";
interface Props {
  code: string;
  device: "mobile" | "desktop";
  appState: AppState,
  fixBug: (error: {
    message: string;
    stack: string;
  }) => void;
}

function Preview({ code, device, appState, fixBug }: Props) {
  const throttledCode = useThrottle(code, 500);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [errorObj, setErrorObj] = useState({
    message: '',
    stack: ''
  });

  useEffect(() => {
    const iframe = iframeRef.current;
    const errorIframe = `
<script>
  window.addEventListener('error', (event) => {
      window.parent.postMessage({
        message: event.message,
        error: event.error
      }, '*')
  })
</script>  
          `;
      let content = '';
    if (appState === AppState.CODE_READY) {
      var patternHead = /<title[^>]*>((.|[\n\r])*)<\/title>/im; //匹配header
      const headMatch = throttledCode.match(patternHead);
      if (headMatch) {
        const headContent = headMatch[0] + errorIframe;
        content = throttledCode.replace(patternHead, headContent);
      }

      if (iframe && iframe.contentDocument) {
        iframe.contentDocument.open();
        iframe.contentDocument.write(content || code);
        iframe.contentDocument.close();
      }
    }
 
    
  }, [throttledCode]);

  useEffect(() => {
    const messageHandler = (e: any) => {
      if (e.data && e.data.error) {
        setErrorObj({
          message: e.data.error.message,
          stack: e.data.error.stack
        });
        setShowDebug(true);
      }
    }
    window.addEventListener('message', messageHandler);
    return () => {
      window.removeEventListener('message', messageHandler);
    }
  }, [])

  return (
    <div className="flex justify-center mx-2">
      {
        showDebug && (
          <span
            onClick={() => {
              fixBug(errorObj);
            }}
            className='text-red-600 absolute right-14 top-16 z-[50] hover:bg-slate-200 rounded-sm p-2'>
            <FaBug />
          </span>
        )
      }
      <iframe
        id={`preview-${device}`}
        ref={iframeRef}
        title="Preview"
        className={classNames(
          "border-[4px] border-black rounded-[20px] shadow-lg",
          "transform scale-[0.9] origin-top",
          {
            "w-full h-[700px]": device === "desktop",
            "w-[400px] h-[700px]": device === "mobile",
          }
        )}
      ></iframe>
    </div>
  );
}

export default Preview;