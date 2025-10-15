'use client';
import { useStore } from '@nanostores/react';
import { chatStore } from '@/lib/stores/chat';
import { useWorkspace } from '@/lib/hooks/useWorkspace';
import { classNames } from '@/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '@/lib/persistence/ChatDescription.client';
import Link from 'next/link';
import { Button } from '@/components/shadui/button';
import { useSession } from "next-auth/react"
import { Badge } from '@/components/shadui/badge';
import { UserDropdownMenu } from './UserDropdownMenu';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';


export function Header() {
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
      <div className="flex items-center gap-2 z-logo cursor-pointer">
        {/* <div className="i-ph:sidebar-simple-duotone text-xl" /> */}
        <Link href="/" className="text-2xl font-semibold text-accent flex items-center">
          {/* <span className="i-bolt:logo-text?mask w-[46px] inline-block" /> */}
          <img src="/logo.png" alt="logo" className="w-6" />
          {!isRootPage && ( // Display ChatDescription and HeaderActionButtons only when the chat has started.
              <>
                <span className="flex-1 px-2 truncate text-center text-bolt-elements-textPrimary">
                  <ChatDescription />
                </span>
              </>
            )}
          {isRootPage && (
            <span className="inline-block text-bolt-elements-textPrimary ml-2 text-2xl font-semibold">needware</span>
          )}
        </Link>
       
        {/* {isRootPage && (
          <Badge variant="outline" className="bg-stone-500 text-white">
            <span className="text-xs">Beta</span>
          </Badge>
        )} */}

      </div>
      {isRootPage && (
      <div className="flex-1 flex justify-center">
        <Link href="/pricing" className="text-2xl font-semibold flex items-center hover:opacity-80 transition-opacity duration-200" style={{ color: '#e6d96a' }}>
            <span className="inline-block text-xl font-semibold">Pricing</span>
        </Link>
      </div>
      )}
      {
        session && isRootPage && (
          <div className="flex items-center gap-4 ml-auto z-10">
            <UserDropdownMenu />
          </div>
        )
      }
    
      {
        session && !isRootPage && (
          <div className="flex items-center gap-4 ml-auto z-10">
            <HeaderActionButtons />
          </div>
        )
      }
       
      {!session && (
       <div className="flex items-center gap-4 ml-auto z-10">
          <Link
            href="/login"
          >
            <Button size="sm" className="rounded-[4px]">Sign In</Button>
          </Link>
          <Link
            href="/login"
            className='-ml-[6px]'
          >
            <Button size="sm" className="bg-[#e6d96a] dark:bg-[#e6d96a] hover:bg-[#f0e48f] dark:hover:bg-[#e6d96a]/80 rounded-[4px]">Get Started</Button>
          </Link>
        </div>
      )}
    </header>
  );
}