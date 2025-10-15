import type { Metadata } from "next";
import type { ReactNode } from "react";
import { auth } from "auth"
import { SessionProvider } from "next-auth/react"
import { Header } from '@/components/header/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  title: "needware",
  description: "Access your AI-powered development workspace. Build, deploy, and manage your software projects with needware's intelligent platform.",
};

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  return (
    <SessionProvider basePath={"/api/auth"} session={session}>
      <div className="flex flex-col h-full w-full">
        {children}
      </div>
      <ToastContainer />
    </SessionProvider>
   
  );
}
