import Image from "next/image";
import { Suspense } from "react";
import LoginGithubButton from "./login-git-button";
import LoginGoogleButton from "./login-google-button";
import type { Metadata } from 'next';
// import LoginNotionButton from "./login-notion-button";

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to needware and start building amazing software with AI. Access your development workspace and transform ideas into code.',
  openGraph: {
    title: 'Sign In | needware',
    description: 'Sign in to needware and start building amazing software with AI. Access your development workspace.',
    type: 'website',
  },
  twitter: {
    title: 'Sign In | needware',
    description: 'Sign in to needware and start building amazing software with AI. Access your development workspace.',
  },
};

export default function LoginPage() {
  return (
    <div className="flex w-full h-screen bg-gradient-to-b from-[#0a0a0a] to-[#121212]">
      {/* 左侧登录区域 */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center items-center relative">
        {/* 装饰元素 */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
        
        <div className="max-w-md w-full text-center">
          <div className="mb-12 flex justify-center">
            <div className="p-3 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm shadow-lg">
              <img 
                src="/logo.png" 
                alt="gently logo" 
                className="h-10 transition-all duration-300 hover:opacity-80" 
              />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Welcome</h1>
          <p className="text-gray-400 mb-10 text-lg">Sign in to continue to your workspace</p>
          
          <div className="space-y-4">
            <Suspense
              fallback={
                <div className="h-14 w-full rounded-xl bg-gray-800/50 animate-pulse" />
              }
            >
              <LoginGoogleButton className="w-full flex items-center justify-center space-x-3 py-4 px-5 bg-white/5 hover:bg-white/10 rounded-xl text-white border border-white/10 transition-all duration-200 shadow-lg shadow-black/10 backdrop-blur-sm" />
            </Suspense>

            <Suspense
              fallback={
                <div className="h-14 w-full rounded-xl bg-gray-800/50 animate-pulse" />
              }
            >
              <LoginGithubButton className="w-full flex items-center justify-center space-x-3 py-4 px-5 bg-white/5 hover:bg-white/10 rounded-xl text-white border border-white/10 transition-all duration-200 shadow-lg shadow-black/10 backdrop-blur-sm" />
            </Suspense>

            {/* <Suspense
              fallback={
                <div className="h-14 w-full rounded-xl bg-gray-800/50 animate-pulse" />
              }
            >
              <LoginNotionButton className="w-full flex items-center justify-center space-x-3 py-4 px-5 bg-white/5 hover:bg-white/10 rounded-xl text-white border border-white/10 transition-all duration-200 shadow-lg shadow-black/10 backdrop-blur-sm" />
            </Suspense> */}
          </div>
          
          <p className="text-gray-500 text-sm mt-10 text-center">
            By signing in, you agree to our <a href="/terms" className="text-gray-400 hover:text-white transition-colors underline decoration-dotted underline-offset-2">Terms of Service</a> and <a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors underline decoration-dotted underline-offset-2">Privacy Policy</a>
          </p>
        </div>
      </div>
      
      {/* 右侧展示区域 */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        {/* 背景渐变和装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-[#2a2a3a] to-[#1c1c1c] z-0"></div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-700/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-violet-700/20 rounded-full filter blur-3xl animate-pulse-slower"></div>
        
        {/* 内容 */}
        <div className="relative z-10 p-16 flex flex-col justify-between h-full w-full">
          <div className="absolute top-12 right-12">
            <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-xs text-gray-300">Online</p>
            </div>
          </div>
          
          <div></div>
          <div className="max-w-md">
            <div className="mb-2 text-indigo-400 font-medium">AI-POWERED DEVELOPMENT</div>
            <h2 className="text-5xl font-bold mb-6 text-white leading-tight">What would you build today?</h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              You ask, needware builds — instantly transform your ideas into production-ready code with AI assistance.
            </p>
            
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <p className="text-sm text-gray-400">Made with gently.</p>
          </div>
        </div>
      </div>
    </div>
  );
}