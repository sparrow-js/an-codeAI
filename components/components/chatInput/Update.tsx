
import { useContext, useEffect, useRef, useState, useMemo } from 'react';

interface Props {
  updateSendMessage: (message: string) => void
}

export default function UpdateChatInput({updateSendMessage}: Props) {
  const [chatValue, setChatValue] = useState('');
  const inputRef = useRef<any>(null);
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'inherit'; // Reset the height
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`; // Set it to the scrollHeight
    }
  }, [chatValue]);

  const updateHandler = () => {
    updateSendMessage(chatValue);
    setChatValue('');
  }

  return (

      <div 
        className="overflow-hidden max-w-[90%]  bottom-0 flex flex-col w-full sm:max-w-lg m-auto shadow-lg divide-zinc-600 min-h-12 bg-gray-900 shadow-black/40 rounded-[24px]"
      >
        <div className="flex items-center flex-1 min-w-0 px-3 md:pl-4 bg-gray-900 relative z-10">
            <div
              className="relative w-full flex items-center transition-all duration-300 min-h-full h-fit" >
              <label htmlFor="textarea-input" className="sr-only">Prompt</label>
              <div className="relative flex flex-1 min-w-0 self-start">
                <div className="flex-[1_0_50%] min-w-[50%] overflow-x-visible -ml-[100%] opacity-0 invisible pointer-events-none">
                  <div className="[&amp;_textarea]:px-0 opacity-0 invisible pointer-events-none">A "report an issue" modal</div>
                </div>
                <textarea
                  maxLength={1000}
                  ref={inputRef}
                  className="flex-[1_0_50%] min-w-[50%] disabled:opacity-80 text-white text-sm bg-transparent border-0 shadow-none resize-none outline-none ring-0 disabled:bg-transparent selection:bg-indigo-300 selection:text-black placeholder:text-zinc-400 [scroll-padding-block:0.75rem] pr-2 leading-relaxed py-3 pl-1 [&amp;_textarea]:px-0" 
                  spellCheck="false" 
                  rows={1} 
                  placeholder="Tell the AI what to change" 
                  style={{
                    resize: 'none',
                    colorScheme: 'dark',
                    overflow: 'auto'
                  }}
                  value={chatValue}
                  onChange={(e) => {
                    setChatValue(e.target.value);
                  }}
                ></textarea>
              </div>
              <div className="flex items-center">
                <button 
                  className="shrink-0 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-transparent text-white hover:bg-gray-800 flex items-center justify-center focus-visible:ring-0 focus-visible:bg-gray-800 rounded-full w-[28px] h-[28px]" 
                  type="submit" 
                  id="update-button"
                  onClick={updateHandler}
                >
                  <span className="sr-only">Send</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M13.5 3V2.25H15V3V10C15 10.5523 14.5522 11 14 11H3.56062L5.53029 12.9697L6.06062 13.5L4.99996 14.5607L4.46963 14.0303L1.39641 10.9571C1.00588 10.5666 1.00588 9.93342 1.39641 9.54289L4.46963 6.46967L4.99996 5.93934L6.06062 7L5.53029 7.53033L3.56062 9.5H13.5V3Z" fill="currentColor"></path>
                  </svg>
                </button>
              </div>
            </div>
        </div>
      </div>
  );
}
