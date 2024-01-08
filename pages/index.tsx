import { useState, useRef, useContext, useMemo, useEffect } from 'react';
import Header from "../components/components/Header";
import ChatInput from "../components/components/chatInput";
// import OnboardingNote from "../components/components/OnboardingNote";
import {SettingContext} from '../components/contexts/SettingContext';
import {UploadFileContext} from '../components/contexts/UploadFileContext'
import { IS_RUNNING_ON_CLOUD } from "../components/config";
import { useRouter } from 'next/router';
import classNames from 'classnames';
import WechatDialog from '../components/custom/WechatDialog';
import QqDialog from '../components/custom/QqDialog';

import dynamic from "next/dynamic";
const Whiteboard = dynamic(
    async () => (await import("../components//components/Whiteboard")),
    {
      ssr: false,
    },
  )
  
// Whiteboard

const baseStyle = {
    outline: "none",
    transition: "border .24s ease-in-out",
  };
  
  const focusedStyle = {};
  
  const acceptStyle = {
    borderWidth: 2,
    borderRadius: 2,
    borderStyle: "dashed",
    borderColor: "#00e676",
  };
  
  const rejectStyle = {
    borderWidth: 2,
    borderRadius: 2,
    borderStyle: "dashed",
    borderColor: "#ff1744",
  };
  

export default function Dashboard() {
    const { settings, setSettings, setInitCreate } = useContext(SettingContext);
    const { getRootProps, 
        isDragAccept,
        isFocused,
        isDragReject, 
        setUploadComplete,
        setDataUrls,
        open,
    } = useContext(UploadFileContext);
    const [openWhiteboard, setOpenWhiteboard] = useState(false);
    const [showAnim, setShowAnim] = useState<boolean>(false);
    const ref = useRef(null);
    const router = useRouter();
    useEffect(() => {
        setUploadComplete(() => {
            setInitCreate(true);
            router.push('/editor')
        })
    }, []);

    const style = useMemo(
        () => ({
        ...baseStyle,
        ...(isFocused ? focusedStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {}),
        }),
        [isFocused, isDragAccept, isDragReject]
    );

    useEffect(() => {
        // Prefetch the dashboard page
        router.prefetch('/editor')
      }, [router])
    

    return (
        <div 
            {...getRootProps({ style: style as any })}
            className="dark:bg-black dark:text-white h-full"
        >
            <div className='fixed w-full bg-slate-50 z-20'>
                <Header />
            </div>
            <main>
                <div className='fixed right-0 top-20 w-[115px] flex flex-col items-center  justify-center py-6 gap-12'>
                    <div
                        onClick={open}
                        className='cursor-pointer before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-pink-500 relative inline-block px-2'>
                        <span className='relative text-white'>🔥screenshot</span>
                    </div>
                    <div
                        onClick={() => {
                            setOpenWhiteboard(true);
                        }}
                        className='cursor-pointer before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-green-500 relative inline-block px-4'>
                        <span className='relative text-white'>whiteboard</span>
                    </div>
                    <div 
                        onClick={() => {
                            setShowAnim(true);
                            setTimeout(() => {
                                setShowAnim(false);
                            }, 800)
                        }}
                        className='cursor-pointer before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-cyan-500 relative inline-block px-9'
                        >
                        <span className='relative text-white'>ideas</span>
                    </div>
                </div>

                <div className="w-full bg-white dark:bg-gray-800 border-t dark:border-t-gray-600 flex-col flex items-center justify-between p-3">
                    <div className="relative mt-96 w-[520px] rounded-md shadow-sm">
                        <ChatInput
                            openWhiteboard={() => {
                                setOpenWhiteboard(true);
                            }}
                            showAnim={showAnim}
                        />
                    </div>
                </div>
                <div className='flex flex-col w-full items-center justify-center mt-14'>
                    <p className='text-center mb-4 text-lg'>Follow Us</p>
                    <div className='flex justify-center items-center gap-2'>
                        <a className='hover:bg-[#0172aa] rounded p-2 bg-[#0088cc] text-white flex justify-center items-center' href='#' target="_blank">
                            <span className='mr-2 flex justify-center items-center'>
                                <svg fill='#fff' viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1591"  width="20" height="20"><path d="M512 16C238 16 16 238 16 512s222 496 496 496 496-222 496-496S786 16 512 16z m243.6 339.8l-81.4 383.6c-6 27.2-22.2 33.8-44.8 21l-124-91.4-59.8 57.6c-6.6 6.6-12.2 12.2-25 12.2l8.8-126.2 229.8-207.6c10-8.8-2.2-13.8-15.4-5l-284 178.8-122.4-38.2c-26.6-8.4-27.2-26.6 5.6-39.4l478.2-184.4c22.2-8 41.6 5.4 34.4 39z" p-id="1592"></path></svg>
                            </span>
                            <span>Telegram</span>
                        </a>
                        <a className='hover:bg-[#181f75] rounded p-2 bg-[#222ca0] text-white flex justify-center items-center' href='#' target='_blank'>
                            <span className='mr-2 flex justify-center items-center'>
                                <svg fill='#fff' viewBox="0 0 1280 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6005" width="30" height="20"><path d="M1049.062 139.672a3 3 0 0 0-1.528-1.4A970.13 970.13 0 0 0 808.162 64.06a3.632 3.632 0 0 0-3.846 1.82 674.922 674.922 0 0 0-29.8 61.2 895.696 895.696 0 0 0-268.852 0 619.082 619.082 0 0 0-30.27-61.2 3.78 3.78 0 0 0-3.848-1.82 967.378 967.378 0 0 0-239.376 74.214 3.424 3.424 0 0 0-1.576 1.352C78.136 367.302 36.372 589.38 56.86 808.708a4.032 4.032 0 0 0 1.53 2.75 975.332 975.332 0 0 0 293.65 148.378 3.8 3.8 0 0 0 4.126-1.352A696.4 696.4 0 0 0 416.24 860.8a3.72 3.72 0 0 0-2.038-5.176 642.346 642.346 0 0 1-91.736-43.706 3.77 3.77 0 0 1-0.37-6.252 502.094 502.094 0 0 0 18.218-14.274 3.638 3.638 0 0 1 3.8-0.512c192.458 87.834 400.82 87.834 591 0a3.624 3.624 0 0 1 3.848 0.466 469.066 469.066 0 0 0 18.264 14.32 3.768 3.768 0 0 1-0.324 6.252 602.814 602.814 0 0 1-91.78 43.66 3.75 3.75 0 0 0-2 5.222 782.11 782.11 0 0 0 60.028 97.63 3.728 3.728 0 0 0 4.126 1.4A972.096 972.096 0 0 0 1221.4 811.458a3.764 3.764 0 0 0 1.53-2.704c24.528-253.566-41.064-473.824-173.868-669.082zM444.982 675.16c-57.944 0-105.688-53.174-105.688-118.478s46.818-118.482 105.688-118.482c59.33 0 106.612 53.64 105.686 118.478 0 65.308-46.82 118.482-105.686 118.482z m390.76 0c-57.942 0-105.686-53.174-105.686-118.478s46.818-118.482 105.686-118.482c59.334 0 106.614 53.64 105.688 118.478 0 65.308-46.354 118.482-105.688 118.482z" p-id="6006"></path></svg>
                            </span>
                            <span>
                                Discord
                            </span>
                        </a>
                        <WechatDialog />
                        <QqDialog />
                    </div>
                </div>
                <div className='w-full mt-12'>
                  <p className='text-center text-[#636262]'>© 2023 <a className='text-sky-500' href='/' target='_blank'>AIWebsiteGenerator.com.</a> All rights reserved.</p>
                  <p className='text-center text-[#636262]'>Privacy Policy|Terms of Service</p>
                </div>            
                {/* { IS_RUNNING_ON_CLOUD &&
                    !(settings.openAiApiKey) && settings.init && (
                    <div className="fixed left-[20px] bottom-[20px] z-[49]">
                        <OnboardingNote />
                    </div>
                    )
                } */}
            </main>
            <div 
                className={classNames(
                    "fixed w-full h-full top-0 left-0 z-50",
                    {
                     'hidden': !openWhiteboard,
                    }
                )}
            >
                <Whiteboard 
                    doCreate={(urls: string[]) => {
                        setOpenWhiteboard(false);
                        setDataUrls(urls);
                        setInitCreate(true);
                        router.push('/editor')
                    }}
                    closeWhiteboard={() => {
                        setOpenWhiteboard(false);
                    }}
                />
            </div>
        </div>
    );
}