'use client';

import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { cloudStore, cloudActions } from '@/lib/stores/cloud';
import { Database as DatabaseIcon, RefreshCw, Plus, Table } from 'lucide-react';
import { Button } from '@/components/shadui/button';

interface DatabaseViewProps {
  chatId: string;
}

export default function DatabaseView({ chatId }: DatabaseViewProps) {
  const state = useStore(cloudStore);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await cloudActions.loadTables(chatId);
    setIsRefreshing(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Database</h1>
          <p className="text-gray-400 text-sm">
            View tables and edit data
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || state.loadingTables}
            variant="outline"
            className="border-zinc-700 hover:bg-zinc-800"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tables Count */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
        <span>{state.tables.length} {state.tables.length === 1 ? 'Table' : 'Tables'}</span>
      </div>

      {/* Tables List */}
      {state.loadingTables ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading tables...</div>
        </div>
      ) : state.tables.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <Table className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No tables yet</h3>
          <p className="text-gray-400 text-sm mb-6">
            Create your first table to get started with your database
          </p>
          <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
            <Plus className="w-4 h-4 mr-2" />
            Create table
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {state.tables.map((table) => (
            <div
              key={table.name}
              onClick={() => cloudActions.selectTable(chatId, table.name)}
              className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 hover:bg-zinc-850 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                    <DatabaseIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{table.name}</h3>
                    <p className="text-gray-400 text-xs">
                      {table.rowCount} {table.rowCount === 1 ? 'row' : 'rows'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white pointer-events-none"
                >
                  View data
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

