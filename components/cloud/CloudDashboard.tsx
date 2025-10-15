'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { cloudStore, cloudActions } from '@/lib/stores/cloud';
import { Database, Users, HardDrive, Zap, Key, FileText, LayoutDashboard } from 'lucide-react';
import DatabaseView from './Database';
import UsersView from './Users';
import AuthSettings from './AuthSettings';
import StorageView from './Storage';
import EdgeFunctionsView from './EdgeFunctions';
import OverviewView from './Overview';
import TableDetailView from './TableDetail';
import BucketDetailView from './BucketDetail';
import SecretsView from './Secrets';

interface CloudDashboardProps {
  chatId: string;
}

export default function CloudDashboard({ chatId }: CloudDashboardProps) {
  const state = useStore(cloudStore);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load overview data when component mounts
    const initData = async () => {
      await cloudActions.loadOverview(chatId);
      setIsInitialized(true);
    };

    initData();

    return () => {
      // Cleanup if needed
    };
  }, [chatId]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'edge-functions', label: 'Edge Functions', icon: Zap },
    { id: 'secrets', label: 'Secrets', icon: Key },
    // { id: 'logs', label: 'Logs', icon: FileText },
  ] as const;

  const renderContent = () => {
    if (!isInitialized) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400">Loading...</div>
        </div>
      );
    }

    switch (state.currentView) {
      case 'overview':
        return <OverviewView chatId={chatId} />;
      case 'database':
        return <DatabaseView chatId={chatId} />;
      case 'table-detail':
        return <TableDetailView chatId={chatId} />;
      case 'users':
        return <UsersView chatId={chatId} />;
      case 'auth-settings':
        return <AuthSettings chatId={chatId} />;
      case 'storage':
        return <StorageView chatId={chatId} />;
      case 'bucket-detail':
        return <BucketDetailView chatId={chatId} />;
      case 'edge-functions':
        return <EdgeFunctionsView chatId={chatId} />;
      case 'secrets':
        return <SecretsView chatId={chatId} />;
      case 'logs':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Logs</h2>
            <p className="text-gray-400">Logs viewer coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-black flex w-full overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex-shrink-0 overflow-y-auto">
        <div className="p-4">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6 px-2">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            <span className="text-white font-semibold">needware Cloud</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = state.currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => cloudActions.setCurrentView(item.id as any)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                    ${isActive 
                      ? 'bg-zinc-800 text-white' 
                      : 'text-gray-400 hover:bg-zinc-900 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-155px)] flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}

