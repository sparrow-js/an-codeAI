'use client';

import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { cloudStore, cloudActions } from '@/lib/stores/cloud';
import { Zap, RefreshCw, Plus, Package } from 'lucide-react';
import { Button } from '@/components/shadui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadui/dialog';
import { Input } from '@/components/shadui/input';
import { Label } from '@/components/shadui/label';
import { Textarea } from '@/components/shadui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadui/table';
import { Badge } from '@/components/shadui/badge';
import { useToast } from '@/hooks/use-toast';
import EdgeFunctionDetail from './EdgeFunctionDetail';

interface EdgeFunctionsViewProps {
  chatId: string;
}

const DEFAULT_FUNCTION_CODE = `// Follow this format for your function handler
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { name } = await req.json()
  const data = {
    message: \`Hello \${name}!\`,
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})`;

export default function EdgeFunctionsView({ chatId }: EdgeFunctionsViewProps) {
  const state = useStore(cloudStore);
  const [timeRange, setTimeRange] = useState('last_hour');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [functionName, setFunctionName] = useState('');
  const [functionCode, setFunctionCode] = useState(DEFAULT_FUNCTION_CODE);
  const [selectedFunction, setSelectedFunction] = useState<any>(null);
  const { toast } = useToast();

  // If a function is selected, show detail view
  if (selectedFunction) {
    return (
      <EdgeFunctionDetail
        functionData={selectedFunction}
        onBack={() => setSelectedFunction(null)}
      />
    );
  }

  const handleDeploy = async () => {
    if (!functionName.trim()) {
      toast({
        title: '错误',
        description: '请输入函数名称',
        variant: 'destructive',
      });
      return;
    }

    if (!functionCode.trim()) {
      toast({
        title: '错误',
        description: '请输入函数代码',
        variant: 'destructive',
      });
      return;
    }

    setIsDeploying(true);
    try {
      const result = await cloudActions.deployFunction(chatId, functionName, functionCode);
      
      if (result.success) {
        toast({
          title: '成功',
          description: result.message || 'Edge Function 部署成功',
        });
        setIsDialogOpen(false);
        setFunctionName('');
        setFunctionCode(DEFAULT_FUNCTION_CODE);
      } else {
        toast({
          title: '部署失败',
          description: result.error || '部署 Edge Function 时出错',
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '部署 Edge Function 时出错';
      toast({
        title: '部署失败',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeploying(false);
    }
  };

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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Edge Functions</h1>
          <p className="text-gray-400 text-sm">
            Deploy edge functions to handle complex business logic with real-time analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            创建 Edge Function
          </Button> */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800">
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

      {/* Functions Table */}
      {state.loadingFunctions ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading functions...</div>
        </div>
      ) : state.functions.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No edge functions yet</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Edge Functions are server-side TypeScript functions, distributed globally at the edge—close to your users.
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-800/30 border-b border-zinc-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-8 py-3 text-sm text-gray-400 font-normal">Name</TableHead>
                <TableHead className="px-8 py-3 text-sm text-gray-400 font-normal">Status</TableHead>
                <TableHead className="px-8 py-3 text-sm text-gray-400 font-normal">Invocations</TableHead>
                <TableHead className="px-8 py-3 text-sm text-gray-400 font-normal">Success rate</TableHead>
                <TableHead className="px-8 py-3 text-sm text-gray-400 font-normal">Last updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-zinc-800">
              {state.functions.map((func) => (
                <TableRow
                  key={func.id}
                  onClick={() => setSelectedFunction(func)}
                  className="hover:bg-zinc-800/20 transition-colors cursor-pointer border-zinc-800"
                >
                  {/* Name */}
                  <TableCell className="px-8 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white font-normal">{func.name}</span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-8 py-3">
                    <Badge 
                      className={`uppercase ${
                        func.status === 'ACTIVE' || func.status === 'Active' || func.status === 'active'
                          ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20'
                      }`}
                    >
                      {func.status === 'ACTIVE' || func.status === 'Active' || func.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>

                  {/* Invocations */}
                  <TableCell className="px-8 py-3 text-white">
                    {func.invocations !== undefined ? func.invocations.toLocaleString() : '0'}
                  </TableCell>

                  {/* Success Rate */}
                  <TableCell className="px-8 py-3">
                    {func.invocations && func.invocations > 0 && func.successRate !== undefined ? (
                      <span className={`font-medium ${
                        func.successRate > 80 
                          ? 'text-green-500' 
                          : func.successRate > 50
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}>
                        {func.successRate.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">–</span>
                    )}
                  </TableCell>

                  {/* Last Updated */}
                  <TableCell className="px-8 py-3 text-gray-400">
                    {formatTimeAgo(func.updated_at || func.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Function Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">创建 Edge Function</DialogTitle>
            <DialogDescription className="text-gray-400">
              输入函数名称和代码，然后点击部署按钮
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="function-name" className="text-white">
                函数名称
              </Label>
              <Input
                id="function-name"
                placeholder="例如: hello-world"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="function-code" className="text-white">
                函数代码
              </Label>
              <Textarea
                id="function-code"
                placeholder="输入 TypeScript/JavaScript 代码"
                value={functionCode}
                onChange={(e) => setFunctionCode(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 font-mono text-sm min-h-[400px]"
              />
              <p className="text-xs text-gray-500">
                使用 Deno 运行时。支持 TypeScript 和 JavaScript。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            >
              取消
            </Button>
            <Button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isDeploying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  部署中...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  部署
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

