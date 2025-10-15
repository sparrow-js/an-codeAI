'use client';

import React from 'react';
import { useStore } from '@nanostores/react';
import { cloudStore, cloudActions } from '@/lib/stores/cloud';
import { Database, Users, HardDrive, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/shadui/button';

interface OverviewViewProps {
  chatId: string;
}

export default function OverviewView({ chatId }: OverviewViewProps) {
  const state = useStore(cloudStore);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await cloudActions.loadOverview(chatId);
    setIsRefreshing(false);
  };

  const sections = [
    {
      title: 'Database',
      icon: Database,
      count: state.tables.length,
      label: state.tables.length === 1 ? 'Table' : 'Tables',
      items: state.tables.slice(0, 3).map(t => ({
        display: `${t.name} (${t.rowCount} row${t.rowCount !== 1 ? 's' : ''})`,
        name: t.name,
        clickable: true,
      })),
      view: 'database' as const,
    },
    {
      title: 'Users',
      icon: Users,
      count: state.userCount,
      label: state.userCount === 1 ? 'Signup' : 'Signups',
      items: [{ display: 'Auth settings', clickable: true, isAuthSettings: true }],
      view: 'users' as const,
    },
    {
      title: 'Storage',
      icon: HardDrive,
      count: state.buckets.length,
      label: state.buckets.length === 1 ? 'Bucket' : 'Buckets',
      items: state.buckets.slice(0, 3).map(b => ({ 
        display: b.name, 
        name: b.name,
        clickable: true 
      })),
      view: 'storage' as const,
    },
    {
      title: 'Edge Functions',
      icon: Zap,
      count: state.functions.length,
      label: state.functions.length === 1 ? 'Function' : 'Functions',
      items: state.functions.slice(0, 3).map(f => ({ display: f.name, clickable: false })),
      view: 'edge-functions' as const,
    },
  ];

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Overview</h1>
          <p className="text-gray-400 text-sm">
            View tables and manage your project
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="border-zinc-700 hover:bg-zinc-800"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">{section.title}</h2>
                    <p className="text-gray-400 text-xs">
                      View {section.title.toLowerCase()} and edit data
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {section.count} {section.label}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {section.items.length > 0 ? (
                  <div className="space-y-2">
                    {section.items.map((item, index) => {
                      const ItemIcon = 'isAuthSettings' in item && item.isAuthSettings ? Users : section.icon;
                      return (
                        <div
                          key={index}
                          onClick={() => {
                            if (item.clickable) {
                              if (section.title === 'Database' && 'name' in item) {
                                cloudActions.selectTable(chatId, item.name);
                              } else if (section.title === 'Storage' && 'name' in item) {
                                cloudActions.selectBucket(chatId, item.name);
                              } else if ('isAuthSettings' in item && item.isAuthSettings) {
                                cloudActions.setCurrentView('auth-settings');
                              }
                            }
                          }}
                          className={`flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg text-sm text-gray-300 ${
                            item.clickable ? 'cursor-pointer hover:bg-zinc-700 transition-colors' : ''
                          }`}
                        >
                          <ItemIcon className="w-3 h-3 text-gray-500" />
                          {item.display}
                        </div>
                      );
                    })}
                    {section.count > 3 && (
                      <button
                        onClick={() => cloudActions.setCurrentView(section.view)}
                        className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                      >
                        View all {section.count} {section.label.toLowerCase()}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Icon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No {section.title.toLowerCase()} yet</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

