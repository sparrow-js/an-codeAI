
import { useSession } from "next-auth/react"

export const SidebarLeft = () => {
    const { data: session } = useSession();
    return (
      <div className="fixed top-[var(--header-height)] bottom-0 z-10 flex flex-col items-center justify-end pl-2.5 py-3 text-bolt-elements-textPrimary">
        {session?.user?.image && (
            <img src={session.user.image} alt="user" className="w-6 h-6 rounded-full mb-2" />
        )}
        <div className="i-ph-sidebar-simple-duotone text-xl" />
      </div>
    )
}