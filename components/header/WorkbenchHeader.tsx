'use client';
import { useStore } from '@nanostores/react';
import { chatStore } from '@/lib/stores/chat';
import { useWorkspace } from '@/lib/hooks/useWorkspace';
import { classNames } from '@/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '@/lib/persistence/ChatDescription.client';
import Link from 'next/link';
import { useSession } from "next-auth/react"
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Cloud } from "lucide-react"


export function WorkbenchHeader() {
  const chat = useStore(chatStore);
  const { data: session } = useSession();
  const { currentWorkspace, fetchWorkspace, initialized } = useWorkspace();

  useEffect(() => {
    // 当用户登录后且未初始化时，初始化 workspace
    if (session?.user && !initialized) {
      fetchWorkspace();
    }
  }, [session, initialized, fetchWorkspace])

  // 使用 router 判断
  const pathname = usePathname();
  const isRootPage = pathname === '/' || pathname === '/pricing';

  return (
    <header
      className={classNames('fixed top-0 left-0 right-0 flex items-center p-5 border-b h-[var(--header-height)] backdrop-blur-xl backdrop-saturate-150 backdrop-brightness-110 z-50', {
        'border-transparent': !chat.started,
        'border-bolt-elements-borderColor': chat.started,
      })}
      style={{ backgroundColor: 'rgba(54, 54, 53, 0.85)' }}
    >
      <div className="flex gap-2 z-logo cursor-pointer flex-col flex-grow">
        {/* <div className="i-ph:sidebar-simple-duotone text-xl" /> */}
     
        <Link href="/" className="text-2xl font-semibold text-accent flex items-center">
          {/* <span className="i-bolt:logo-text?mask w-[46px] inline-block" /> */}
          <img src="/logo.png" alt="logo" className="w-6" />
          <span className="px-2 truncate text-left text-bolt-elements-textPrimary">
            <ChatDescription />
          </span>

        </Link>

      </div>
      <div style={{ width: 'var(--workbench-width)' }} className="flex items-center justify-between">
        <div className='pl-5'>
            {/* <Cloud className='w-6 h-6' /> */}
        </div>
        <div>
        {
            session && (
            <div className="flex items-center gap-4 z-10">
                <HeaderActionButtons />
            </div>
            )
        }
        </div>
      </div>
    </header>
  );
}