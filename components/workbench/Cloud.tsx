'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { Button } from '@/components/shadui/button';
import { Database, Zap, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { chatId } from '@/lib/persistence';
import { workspaceStore } from '@/lib/stores/workspace';
import { cloudStore, cloudActions } from '@/lib/stores/cloud';
import CloudDashboard from '@/components/cloud/CloudDashboard';

function CloudEnableView({ sendMessage }: { sendMessage: (message: string) => void }) {
  const [isCreating, setIsCreating] = useState(false);

  const handleEnableCloud = async () => {
    const projectName = chatId.get();
    const workspaceId = workspaceStore.getCurrentWorkspaceId();
    if (!projectName) {
      toast.error("Unable to get project name");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/supabase/create-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          plan: "free",
          workspaceId: workspaceId,
          chatId: chatId.get()
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message || "Cloud enabled!");
        // Reload cloud status
        const currentChatId = chatId.get();
        if (currentChatId) {
          await cloudActions.checkCloudStatus(currentChatId);
        }

        console.log('********* result *********');

        sendMessage('Enable Cloud for this project.');

      } else {
        toast.error(result.error || "Failed to enable Cloud");
      }
    } catch (error: any) {
      toast.error("Failed to enable Cloud: " + (error.message || "Unknown error"));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center p-4 w-full">
      <div className="w-full max-w-xl">
        {/* Main Card */}
        <div className="bg-zinc-900 rounded-xl p-6 shadow-2xl border border-zinc-800">
          {/* Header */}
          <div className="flex mb-4">
            <div className="flex items-center gap-2">
              {/* Logo */}
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              </div>
              <h1 className="text-2xl font-bold text-white">needware Cloud</h1>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-base mb-6">
            Complete backend and AI models out of the box, so you can focus on building
            your app.
          </p>

          {/* Features */}
          <div className="space-y-4 mb-6">
            {/* Feature 1 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base mb-0.5">
                  Built-in backend
                </h3>
                <p className="text-gray-400 text-xs">
                  Database, storage, authentication, and backend logic—all ready to use.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base mb-0.5">
                  Add an LLM to your app
                </h3>
                <p className="text-gray-400 text-xs">
                  Powerful AI models with zero setup. Add chat, image generation, and
                  text analysis instantly.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base mb-0.5">
                  Free to start, pay as you scale
                </h3>
                <p className="text-gray-400 text-xs">
                  Free usage included everywhere. Top up on paid plans. Track usage in
                  Settings → Usage.
                </p>
              </div>
            </div>
          </div>

          {/* Enable Button */}
          <Button
            onClick={handleEnableCloud}
            disabled={isCreating}
            className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enabling...
              </>
            ) : (
              "Enable Cloud"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CloudDetail({ sendMessage }: { sendMessage: (message: string) => void }) {
  const state = useStore(cloudStore);
  const currentChatId = chatId.get();

  useEffect(() => {
    // Check cloud status when component mounts
    if (currentChatId) {
      cloudActions.checkCloudStatus(currentChatId);
    }
  }, [currentChatId]);

  // Show loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  // Show dashboard if cloud is enabled, otherwise show enable view
  if (state.isEnabled && currentChatId) {
    return <CloudDashboard chatId={currentChatId} />;
  }

  return <CloudEnableView sendMessage={sendMessage} />;
}
