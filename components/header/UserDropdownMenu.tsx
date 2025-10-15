import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from '@/components/shadui/dropdown-menu';
import { Button } from '@/components/shadui/button';
import { FiInfo, FiSettings, FiUserPlus, FiPlus, FiHelpCircle, FiMoon, FiLogOut } from 'react-icons/fi';
import { signOut } from 'next-auth/react';
import SettingDialog from './setting-dialog';
import { workspaceStore } from '@/lib/stores/workspace';
import { useWorkspace } from '@/lib/hooks/useWorkspace';

export function UserDropdownMenu() {
    const { data: session } = useSession();
    const user = session?.user;
    const { currentWorkspace, fetchWorkspace } = useWorkspace();
    const [credits, setCredits] = useState(0);
    const [totalCredits, setTotalCredits] = useState(0);
    const [open, setOpen] = useState(false);
    const [openSettingDialog, setOpenSettingDialog] = useState(false);
    const tabValue = useRef<string>('');

    const getCredits = async () => {

      const workspaceId = workspaceStore.getCurrentWorkspaceId();
      const responseCredits = await fetch(`/api/usage/get-credits?workspaceId=${workspaceId}`);
      if (!responseCredits.ok) throw new Error('Failed to fetch credits');
      const creditsData = await responseCredits.json();
      setCredits(creditsData.credits);
      setTotalCredits(creditsData.totalCredits);
    }
  
    const loadEntries = useCallback(async () => {
      try {
        getCredits();
        fetchWorkspace();
      } catch (error) {
      }
    }, [fetchWorkspace]);
  
    
    useEffect(() => {
      if (open) {
        loadEntries();
      }
    }, [open]);
  
    // 获取首字母
    const getInitial = (name?: string, email?: string) => {
      if (name && name.length > 0) return name[0].toUpperCase();
      if (email && email.length > 0) return email[0].toUpperCase();
      return "U";
    };
  
    return (
      <>
       <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 p-2 rounded hover:bg-zinc-800">
            <div className="bg-neutral-600 text-white rounded-xl w-8 h-8 flex items-center justify-center font-bold overflow-hidden">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || user.email || "User"}
                  className="w-full h-full object-cover rounded-xl"
                  loading="eager"
                  decoding="sync"
                />
              ) : (
                getInitial(user?.name ?? undefined, user?.email ?? undefined)
              )}
            </div>
            <span className="font-semibold text-white">{user?.name || ""}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px] border border-[#272725]">
          {/* 用户信息 */}
          <div className="pb-2 flex items-center gap-4 px-1.5 my-2">
            <div className="bg-yellow-600 text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-xl overflow-hidden">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || user.email || "User"}
                  className="w-full h-full object-cover rounded-xl"
                  loading="eager"
                  decoding="sync"
                />
              ) : (
                getInitial(user?.name ?? undefined, user?.email ?? undefined)
              )}
            </div>
            <div>
              <div className="font-bold text-lg text-white">{user?.name || "My needware"}</div>
              <div className="text-xs text-zinc-400">{user?.email || "sparrowwht7@gmail.com"}</div>
            </div>
          </div>
          {/* Credits Used 卡片 */}
          <div className="bg-bolt-elements-background-depth-2 rounded-xl p-4 mx-1.5">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-base">Credits</span>
              <span className="text-sm text-zinc-300 cursor-pointer">Manage</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(credits)/totalCredits*100}%` }} />
              </div>
              <span className="text-sm text-zinc-300 font-semibold">{credits}</span>
            </div>
            {/* <div className="flex items-center text-xs text-zinc-400 gap-1">
              {credits} of your daily credits used
              <FiInfo className="inline-block" />
            </div> */}
          </div>
          {/* Settings & Invite */}
          <div className="flex gap-2 my-4 mx-1.5">
            <Button 
              className="flex-1 flex items-center gap-2 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg py-2 justify-center"
              onClick={() => {
                tabValue.current = 'workspace';
                setOpenSettingDialog(true);
              }}
            >
              <FiSettings /> Settings
            </Button>
            {/* <Button 
              className="flex-1 flex items-center gap-2 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg py-2 justify-center"
              onClick={() => {
                tabValue.current = 'people';
                setOpenSettingDialog(true);
              }}
            >
              <FiUserPlus /> Invite
            </Button> */}
          </div>
          {/* Workspace & Plan */}
          <div className="flex items-center gap-2 mb-2 mx-1.5">
            <div className="bg-yellow-600 text-white rounded-xl w-7 h-7 flex items-center justify-center text-base font-bold overflow-hidden">
              {currentWorkspace?.icon ? (
                currentWorkspace.icon.startsWith('http') || currentWorkspace.icon.startsWith('/') || currentWorkspace.icon.startsWith('data:') ? (
                  <img
                    src={currentWorkspace.icon}
                    alt={currentWorkspace.name || "Workspace"}
                    className="w-full h-full object-cover rounded-xl"
                    loading="eager"
                    decoding="sync"
                  />
                ) : (
                  currentWorkspace.icon
                )
              ) : (
                currentWorkspace?.name?.[0]?.toUpperCase() || 'W'
              )}
            </div>
            <span className="font-semibold text-white">{currentWorkspace?.name || "My Workspace"}</span>
            <span className="bg-zinc-800 text-zinc-200 font-bold ml-2 px-3 py-1 rounded-full text-xs">
              {currentWorkspace?.plan || 'FREE'}
            </span>
          </div>
          {/* Create new workspace */}
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <FiPlus /> <span>Create new workspace</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2 bg-zinc-700" />
            {/* Help Center, Appearance */}
            <DropdownMenuItem onClick={() => {
              window.open('https://github.com/sparrow-js/an-codeAI/discussions', '_blank');
            }}>
              <FiHelpCircle /> <span>Help Center</span>
            </DropdownMenuItem>
  
            {/* <DropdownMenuSub>
              <DropdownMenuSubTrigger className="py-2 flex items-center gap-2 text-white hover:bg-[#232e47] cursor-pointer justify-between">
              <span className="flex items-center gap-2"><FiMoon /> Appearance</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="border border-[#272725] bg-bolt-elements-background-depth-2">
                  <DropdownMenuItem className="py-2 flex items-center gap-2 text-white hover:bg-[#232e47] cursor-pointer justify-between">dark</DropdownMenuItem>
                  <DropdownMenuItem className="py-2 flex items-center gap-2 text-white hover:bg-[#232e47] cursor-pointer justify-between">light</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub> */}
            <DropdownMenuItem className="py-2 flex items-center gap-2 text-white hover:bg-[#232e47] cursor-pointer justify-between"                  
             onClick={() => signOut()}
            >
              <span className="flex items-center gap-2"><FiLogOut /> Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingDialog open={openSettingDialog} onOpenChange={setOpenSettingDialog} tabValue={tabValue.current} />
      </>
     
    );
  }
  