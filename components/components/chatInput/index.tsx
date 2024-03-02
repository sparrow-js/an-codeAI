import { useContext, useEffect, useRef, useState, useMemo } from 'react';
import {UploadFileContext} from '../../contexts/UploadFileContext'
import { SettingContext } from '../../contexts/SettingContext';
import { useRouter } from 'next/router';
import { LiaPencilRulerSolid } from "react-icons/lia";
import classNames from "classnames";
import { GoArrowUpRight } from "react-icons/go";
import Spinner from '../Spinner';

const shortcutIdeas = [
  {
    id: 'Productcategories',
    label: 'Product categories',
    value: 'A list of product categories with image, name and description.',
  },
  {
    id: 'HeroSection',
    label: 'Hero section',
    value: 'A landing page hero section with a heading, leading text and an opt-in form.',
  },
  // {
  //   id: 'Contactform',
  //   label: 'Contact form',
  //   value: 'A contact form with first name, last name, email, and message fields. Put the form in a card with a submit button.'
  // },
  {
    id: 'Ecommercedashboard',
    label: 'Ecommerce dashboard',
    value: 'An ecommerce dashboard with a sidebar navigation and a table of recent orders.'
  }
]

interface props {
  openWhiteboard: () => void;
  showAnim: boolean;
}

export default function ChatInput({openWhiteboard, showAnim}: props) {
  const inputRef = useRef<any>(null);
  const router = useRouter();
  const {
    getInputProps,
    open,
  } = useContext(UploadFileContext);
  


  const [loading, setLoading] = useState<boolean>(false);

  const { initCreateText, setInitCreateText, setInitCreate, initCreate } = useContext(SettingContext);
  useEffect(() => {
    inputRef.current.focus();
  }, [showAnim])
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'inherit'; // Reset the height
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`; // Set it to the scrollHeight
    }
  }, [initCreateText]);

  const clickHandler = () => {
    if (initCreateText) {
      setLoading(true);
      setInitCreate(true);
      router.push('/editor/create');
      // setLoading(false);
    }
  }
  
  return (
    <div 
      className="flex flex-col py-[12vh] my-12 justify-center items-center"
    >
      {/* animate-wiggle */}
      <div 
        className={classNames(
          "sm:max-w-lg m-auto shadow-lg divide-zinc-600 min-h-12 bg-violet-950 shadow-black/40 rounded-[24px] overflow-hidden max-w-[90%] flex items-center flex-1 min-w-0 px-3 md:pl-4 bg-gray-900 absolute z-10 bottom-0",
          {
            "animate-wiggle": showAnim,
          }
        )}
      >
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
                className="flex-[1_0_50%] min-w-[50%] disabled:opacity-80 text-white text-sm bg-transparent border-0 shadow-none resize-none outline-none ring-0 disabled:bg-transparent selection:bg-indigo-300 selection:text-black placeholder:text-zinc-400 [scroll-padding-block:0.75rem] pr-2 leading-relaxed py-3 pl-1 [&amp;_textarea]:px-0" 
                spellCheck="false" 
                rows={1} 
                placeholder="enter demand ideas" 
                style={{
                  resize: 'none',
                  colorScheme: 'dark',
                  overflow: 'auto'
                }}
                value={initCreateText}
                onChange={(e) => {
                  setInitCreateText(e.target.value);
                }}
              ></textarea>
            </div>
            <div className="flex items-center">
              <button 
                className="shrink-0 text-m font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-transparent text-white hover:bg-gray-800 flex items-center justify-center focus-visible:ring-0 focus-visible:bg-gray-800 rounded-full w-[28px] h-[28px] text-[19px]" 
                id="send-button"
                onClick={openWhiteboard}
              >
                <span className="sr-only">Send</span>
                <LiaPencilRulerSolid />
              </button>
            
              <label data-id="prompt-form-image-upload" htmlFor="fileUpload" className="shrink-0 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-transparent text-white hover:bg-gray-800 flex items-center justify-center focus-visible:ring-0 focus-visible:bg-gray-800 rounded-full w-[28px] h-[28px] cursor-pointer focus-within:bg-gray-800" data-state="closed">
                <input {...getInputProps()}/>
                <svg onClick={open} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><g clipPath="url(#a)"><path fill="currentColor" fillRule="evenodd" d="M14.5 2.5h-13v6.69l1.47-1.47.22-.22h3.75l.03-.03 3.5-3.5h1.06l2.97 2.97V2.5ZM8 8.56l1.53 1.53.53.53L9 11.68l-.53-.53L6.32 9H3.81l-2.28 2.28-.03.03v1.19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.06L11 5.56 8.03 8.53 8 8.56Zm-8 2.25v1.69A2.5 2.5 0 0 0 2.5 15h11a2.5 2.5 0 0 0 2.5-2.5V9.56l.56-.56-.53-.53-.03-.03V1H0v9.69l-.06.06.06.06Z" clipRule="evenodd"></path></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h16v16H0z"></path></clipPath></defs></svg>
                <span className="sr-only">Upload image</span>
              </label>
              {loading ? (
                <button className='w-[28px] h-[28px] scale-75'>
                  <Spinner />
                </button>
              ) : (
                <button 
                  className="shrink-0 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-transparent text-white hover:bg-gray-800 flex items-center justify-center focus-visible:ring-0 focus-visible:bg-gray-800 rounded-full w-[28px] h-[28px]" 
                  id="send-button"
                  onClick={clickHandler}
                >
                  <span className="sr-only">Send</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M13.5 3V2.25H15V3V10C15 10.5523 14.5522 11 14 11H3.56062L5.53029 12.9697L6.06062 13.5L4.99996 14.5607L4.46963 14.0303L1.39641 10.9571C1.00588 10.5666 1.00588 9.93342 1.39641 9.54289L4.46963 6.46967L4.99996 5.93934L6.06062 7L5.53029 7.53033L3.56062 9.5H13.5V3Z" fill="currentColor"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>
      </div>
      <div className='absolute flex flex-wrap items-center justify-center max-w-full gap-2 px-4 mx-auto mt-6 text-sm top-full whitespace-nowrap'>
          {
            shortcutIdeas.map((shortcut) => {
              return (
              <button
                key={shortcut.id}
                className='text-slate-400 text-sm rounded-full border border-zinc-200 px-2 py-0.5 inline-flex gap-1 items-center whitespace-nowrap select-none hover:border-zinc-800 transition-colors'
                onClick={() => {
                  setInitCreateText(shortcut.value);
                }}
              >
                {shortcut.label}
                <GoArrowUpRight/>
              </button>)
            })
          }
      </div>
    </div>
  );
}
