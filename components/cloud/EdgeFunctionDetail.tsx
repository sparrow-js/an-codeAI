'use client';

import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { cloudStore } from '@/lib/stores/cloud';
import { ChevronLeft, Copy, FileCode, ScrollText } from 'lucide-react';
import { Button } from '@/components/shadui/button';
import { Badge } from '@/components/shadui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadui/select';
import { useToast } from '@/hooks/use-toast';

interface EdgeFunctionDetailProps {
  functionData: {
    verify_jwt: boolean;
    id: string;
    slug: string;
    version: number;
    name: string;
    status: string;
    entrypoint_path: string;
    import_map_path: string | null;
    import_map: boolean;
    created_at: number;
    updated_at: number;
    invocations?: number;
    failed?: number;
    deployments?: number;
    successRate?: number;
    url?: string;
    code?: string;
  };
  onBack: () => void;
}

export default function EdgeFunctionDetail({ functionData, onBack }: EdgeFunctionDetailProps) {
  const state = useStore(cloudStore);
  const [timeRange, setTimeRange] = useState('last_24h');
  const { toast } = useToast();

  const formatTimeAgo = (timestamp?: string | number) => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const past = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const handleCopyURL = () => {
    const supabaseUrl = state.currentProject?.supabaseUrl;
    if (supabaseUrl && functionData.slug) {
      const functionUrl = `${supabaseUrl}/functions/v1/${functionData.slug}`;
      navigator.clipboard.writeText(functionUrl);
      toast({
        title: '已复制',
        description: 'URL 已复制到剪贴板',
      });
    } else {
      toast({
        title: '提示',
        description: '暂无 URL',
        variant: 'destructive',
      });
    }
  };

  const handleViewLogs = () => {
    toast({
      title: '功能开发中',
      description: '日志查看功能正在开发中',
    });
  };

  const handleViewCode = () => {
    toast({
      title: '功能开发中',
      description: '代码查看功能正在开发中',
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Edge Functions</span>
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-3">{functionData.name}</h1>
            <p className="text-gray-400 text-sm">
              View how your Edge Function performed over time.
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px] bg-zinc-900 border-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_hour">Last hour</SelectItem>
              <SelectItem value="last_24h">Last 24 hours</SelectItem>
              <SelectItem value="last_7d">Last 7 days</SelectItem>
              <SelectItem value="last_30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Function Info Card */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
              <FileCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-semibold text-white">{functionData.name}</h2>
                <Badge 
                  className={
                    functionData.status === 'ACTIVE' || functionData.status === 'Active' || functionData.status === 'active'
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }
                >
                  {functionData.status === 'ACTIVE' || functionData.status === 'Active' || functionData.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-gray-400">
                Last updated {formatTimeAgo(functionData.updated_at || functionData.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="text-sm text-gray-400 mb-2">Invoked</div>
          <div className="text-3xl font-bold text-white">
            {functionData.invocations !== undefined ? functionData.invocations.toLocaleString() : '0'}
          </div>
        </div>
        
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="text-sm text-gray-400 mb-2">Failed</div>
          <div className="text-3xl font-bold text-red-500">
            {functionData.failed !== undefined ? functionData.failed.toLocaleString() : '0'}
          </div>
        </div>
        
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="text-sm text-gray-400 mb-2">Deployments</div>
          <div className="text-3xl font-bold text-white">
            {functionData.deployments !== undefined ? functionData.deployments.toLocaleString() : '1'}
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <div className="text-lg mb-2">Performance Chart</div>
            <div className="text-sm">Chart visualization coming soon</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleCopyURL}
          variant="outline"
          className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy URL
        </Button>
        {/* <Button
          onClick={handleViewLogs}
          variant="outline"
          className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"
        >
          <ScrollText className="w-4 h-4 mr-2" />
          View Logs
        </Button>
        <Button
          onClick={handleViewCode}
          variant="outline"
          className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"
        >
          <FileCode className="w-4 h-4 mr-2" />
          View Code
        </Button> */}
      </div>
    </div>
  );
}

