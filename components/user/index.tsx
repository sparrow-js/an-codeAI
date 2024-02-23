"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";

import { SignOutButton } from "@clerk/nextjs";
import { User } from "@/types/user";
import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User as UserIcon,
  UserPlus,
  Users,
} from "lucide-react"

interface Props {
  user: User;
}

export default function User ({ user }: Props) {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={user.avatar_url} alt={user.nickname} />
          <AvatarFallback>{user.nickname}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mx-4">
        <DropdownMenuItem className="text-center truncate">
          <UserIcon className="mr-2 h-4 w-4" />
          <span>{user.nickname ? user.nickname : user.email}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Credits:{" "}{user.credits?.left_credits}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <SignOutButton signOutCallback={() => location.reload()}>
          Log out
          </SignOutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
