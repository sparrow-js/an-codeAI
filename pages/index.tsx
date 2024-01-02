import { useState, useRef, useContext, useMemo, useEffect } from 'react';
import Header from "../components/components/Header";
import ChatInput from "../components/components/chatInput";
import OnboardingNote from "../components/components/OnboardingNote";
import {SettingContext} from '../components/contexts/SettingContext';
import {UploadFileContext} from '../components/contexts/UploadFileContext'
import { IS_RUNNING_ON_CLOUD } from "../components/config";
import { useRouter } from 'next/navigation';

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
    } = useContext(UploadFileContext);
    const [chatValue, setChatValue] = useState('');
    const [lockChat, setLockChat] = useState(false);
    const ref = useRef(null);
    async function sendMessage() {}
    const router = useRouter();
    useEffect(() => {
        setUploadComplete(() => {
            setInitCreate(true);
            router.push('/home', { scroll: false })
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

    return (
        <div 
            {...getRootProps({ style: style as any })}
            className="dark:bg-black dark:text-white h-full"
        >
            <div className='fixed w-full bg-slate-50 z-20'>
                <Header />
            </div>
            <main>
                <div className="w-full bg-white dark:bg-gray-800 border-t dark:border-t-gray-600 flex-col flex items-center justify-between p-3">
                    <div className="relative mt-72 w-[520px] rounded-md shadow-sm">
                        <ChatInput
                            chatValue={chatValue}
                            lockChat={lockChat}
                            sendMessage={sendMessage}
                            setChatValue={setChatValue}
                            inputRef={ref}
                        />
                    </div>
                </div>
                            
                { IS_RUNNING_ON_CLOUD &&
                    !(settings.openAiApiKey) && settings.init && (
                    <div className="fixed left-[20px] bottom-[20px] z-[49]">
                        <OnboardingNote />
                    </div>
                    )
                }
            </main>
        </div>
    );
}