'use client';

import React from 'react';
import { Skeleton } from '@/components/shadui/skeleton';

export function ChatSkeleton() {
  return (
    <div className="flex w-full h-[calc(100vh-56px)] mt-[56px] rounded-2xl overflow-hidden">
      {/* Left Chat Panel */}
      <div className="w-[420px] flex flex-col min-w-0 bg-[#1f1f1f] border-r border-[#333333]">

        {/* Chat Messages Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages Container */}
          <div className="flex-1 px-4 py-6 overflow-y-auto">
            {/* Simple Message Blocks */}
            <div className="space-y-6">
              {/* Message Block 1 */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-32 w-full" />
              </div>
              
              {/* Message Block 2 */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-24 w-full" />
              </div>
              
              {/* Message Block 3 */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
          
          {/* Input Area */}
          <div className="border-t border-[#333333] bg-[#1f1f1f] p-4">
            <div className="relative">
              <div className="min-h-[72px] border border-[#333333] rounded-lg bg-[#2a2a2a] p-3 flex flex-col">
                {/* Placeholder Text */}
                <Skeleton className="h-4 w-44 mb-3" />
                
                {/* Input Controls */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-5" />
                  </div>
                  <Skeleton className="h-7 w-10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Workbench Panel */}
      <div className="flex-1 flex flex-col bg-[#1a1a1a]">
        {/* Preview Area */}
        <div className="flex-1 flex flex-col">
          {/* URL Bar */}
          <div className="flex items-center gap-3 p-3 border-b border-[#333333] bg-[#1f1f1f]">
            <Skeleton className="h-5 w-5" />
            <div className="flex-1 bg-[#2a2a2a] rounded px-3 py-2 border border-[#333333]">
              <Skeleton className="h-3.5 w-full" />
            </div>
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-5" />
          </div>
          
          {/* Preview Content */}
          <div className="flex-1 bg-black">
            {/* Simulated loading state for preview */}
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                <Skeleton className="h-3.5 w-28 mx-auto" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 