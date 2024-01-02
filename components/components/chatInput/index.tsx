import {
  FaDesktop,
  FaMobile,
} from "react-icons/fa";
import classNames from 'classnames';
import { useContext, useEffect, useRef, useState, useMemo } from 'react';
import {UploadFileContext} from '../../contexts/UploadFileContext'

export default function ChatInput({setReferenceImages}: any) {
  const [chatValue, setChatValue] = useState('');
  const [lockChat, setLockChat] = useState(false);
  const inputRef = useRef<any>(null);
  async function sendMessage() {}

  const {
    getInputProps,
    open,
  } = useContext(UploadFileContext)
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'inherit'; // Reset the height
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`; // Set it to the scrollHeight
    }
  }, [chatValue]);

  return (
    <div 
      className="relative"
    >
      <div 
        className="overflow-hidden max-w-[90%] absolute bottom-0 z-10 flex flex-col w-full sm:max-w-lg m-auto shadow-lg divide-zinc-600 min-h-12 bg-gray-900 shadow-black/40 rounded-[24px]"
      >
        <div className="flex items-center flex-1 min-w-0 px-3 md:pl-4 bg-gray-900 relative z-10">
          <form className="w-full h-full">
            <div
              className="relative w-full flex items-center transition-all duration-300 min-h-full h-fit" >
              <label htmlFor="textarea-input" className="sr-only">Prompt</label>
              <div className="relative flex flex-1 min-w-0 self-start">
                <div className="flex-[1_0_50%] min-w-[50%] overflow-x-visible -ml-[100%] opacity-0 invisible pointer-events-none">
                  <div className="[&amp;_textarea]:px-0 opacity-0 invisible pointer-events-none">A "report an issue" modal</div>
                </div>
                <textarea
                  id="home-prompt" 
                  maxLength={1000}
                  ref={inputRef}
                  className="flex-[1_0_50%] min-w-[50%] disabled:opacity-80 text-white text-sm bg-transparent border-0 shadow-none resize-none outline-none ring-0 disabled:bg-transparent selection:bg-teal-300 selection:text-black placeholder:text-zinc-400 [scroll-padding-block:0.75rem] pr-2 leading-relaxed py-3 pl-1 [&amp;_textarea]:px-0" 
                  spellCheck="false" 
                  rows={1} 
                  placeholder="A &quot;report an issue&quot; modal" 
                  style={{
                    resize: 'none',
                    colorScheme: 'dark',
                    overflow: 'auto'
                  }}
                  onChange={(e) => {
                    setChatValue(e.target.value);
                  }}
                ></textarea>
              </div>
              <div className="flex items-center">
                <button className="shrink-0 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-transparent text-white hover:bg-gray-800 flex items-center justify-center focus-visible:ring-0 focus-visible:bg-gray-800 rounded-full w-[28px] h-[28px]" type="button" id="visibility-toggle" data-state="closed">
                  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 translate-x-[2px] shrink-0"><path fill="currentColor" fillRule="evenodd" d="M14 6V4.5a2 2 0 1 0-4 0V6h2v6.5A2.5 2.5 0 0 1 9.5 15h-7A2.5 2.5 0 0 1 0 12.5V6h8.5V4.5a3.5 3.5 0 1 1 7 0V6H14Zm-3.5 1.5h-9v5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-5Z" clipRule="evenodd"></path>
                  </svg>
                  <span className="sr-only">Public</span>
                </button>
                <label data-id="prompt-form-image-upload" htmlFor="fileUpload" className="shrink-0 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-transparent text-white hover:bg-gray-800 flex items-center justify-center focus-visible:ring-0 focus-visible:bg-gray-800 rounded-full w-[28px] h-[28px] cursor-pointer focus-within:bg-gray-800" data-state="closed">
                  <input {...getInputProps()}/>
                  <svg onClick={open} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><g clipPath="url(#a)"><path fill="currentColor" fillRule="evenodd" d="M14.5 2.5h-13v6.69l1.47-1.47.22-.22h3.75l.03-.03 3.5-3.5h1.06l2.97 2.97V2.5ZM8 8.56l1.53 1.53.53.53L9 11.68l-.53-.53L6.32 9H3.81l-2.28 2.28-.03.03v1.19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.06L11 5.56 8.03 8.53 8 8.56Zm-8 2.25v1.69A2.5 2.5 0 0 0 2.5 15h11a2.5 2.5 0 0 0 2.5-2.5V9.56l.56-.56-.53-.53-.03-.03V1H0v9.69l-.06.06.06.06Z" clipRule="evenodd"></path></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h16v16H0z"></path></clipPath></defs></svg>
                  <span className="sr-only">Upload image</span>
                </label>
                <button className="shrink-0 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-transparent text-white hover:bg-gray-800 flex items-center justify-center focus-visible:ring-0 focus-visible:bg-gray-800 rounded-full w-[28px] h-[28px]" type="submit" id="send-button" data-state="closed">
                  <span className="sr-only">Send</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M13.5 3V2.25H15V3V10C15 10.5523 14.5522 11 14 11H3.56062L5.53029 12.9697L6.06062 13.5L4.99996 14.5607L4.46963 14.0303L1.39641 10.9571C1.00588 10.5666 1.00588 9.93342 1.39641 9.54289L4.46963 6.46967L4.99996 5.93934L6.06062 7L5.53029 7.53033L3.56062 9.5H13.5V3Z" fill="currentColor"></path>
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
