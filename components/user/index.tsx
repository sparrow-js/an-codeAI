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
import toast from "react-hot-toast";
import {useContext, useState} from 'react';
import { AppContext } from "../contexts/AppContext";

interface Props {
  user: User;
}

export default function User ({ user }: Props) {
  const { updateCredits } = useContext(AppContext);


  const fetchCreditsInfo = async function () {
    try {
      const uri = "/api/get-credits-info";
      const params = {};

      const resp = await fetch(uri, {
        method: "POST",
        body: JSON.stringify(params),
      });

      if (resp.ok) {
        const res = await resp.json();
        if (res.credits) {
          updateCredits(res.credits);
          return;
        }
      }

      // setUser(null);
    } catch (e) {
      // setUser(null);

      console.log("get user info failed: ", e);
      toast.error("get user info failed");
    }
  };

  return (
    <DropdownMenu onOpenChange={(isOpen) => {
      if (isOpen) {
        fetchCreditsInfo();
      }
    }}>
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
