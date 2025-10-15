'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { cloudStore, cloudActions } from '@/lib/stores/cloud';
import { Users as UsersIcon, RefreshCw, Settings, UserPlus, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shadui/button';
import { Input } from '@/components/shadui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadui/select";
import dynamic from 'next/dynamic';

// Dynamically import chart component to avoid SSR issues
const SignupChart = dynamic(
  () => import('./SignupChart'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 w-full flex items-center justify-center">
        <div className="text-gray-400">Loading chart...</div>
      </div>
    )
  }
);

interface UsersViewProps {
  chatId: string;
}

export default function UsersView({ chatId }: UsersViewProps) {
  const state = useStore(cloudStore);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('7');

  // Load users data when component mounts
  useEffect(() => {
    if (chatId) {
      cloudActions.loadUsers(chatId);
    }
  }, [chatId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await cloudActions.loadUsers(chatId);
    setIsRefreshing(false);
  };

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return state.users;
    
    const query = searchQuery.toLowerCase();
    return state.users.filter(user => 
      user.email?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    );
  }, [state.users, searchQuery]);

  // Process signup stats for the selected time range
  const chartData = useMemo(() => {
    const days = parseInt(timeRange);
    const today = new Date();
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const stat = state.signupStats.find(s => s.date === dateStr);
      result.push({
        date: dateStr,
        count: stat ? stat.count : 0,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }

    return result;
  }, [state.signupStats, timeRange]);

  // Calculate total signups in the selected period
  const totalSignupsInPeriod = useMemo(() => {
    return chartData.reduce((sum, d) => sum + d.count, 0);
  }, [chartData]);

  // Format relative time
  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 Day Ago';
    if (diffDays < 30) return `${diffDays} Days Ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 Month Ago';
    if (diffMonths < 12) return `${diffMonths} Months Ago`;
    
    const diffYears = Math.floor(diffDays / 365);
    return diffYears === 1 ? '1 Year Ago' : `${diffYears} Years Ago`;
  };

  // Get login method display
  const getLoginMethods = (providers?: string[]) => {
    if (!providers || providers.length === 0) return 'Email';
    return providers.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
  };

  // Get user initial
  const getUserInitial = (email?: string) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  // Generate random color for avatar
  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-pink-500',
      'bg-purple-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
    ];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="h-[calc(100vh-145px)] flex flex-col bg-black">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => cloudActions.setCurrentView('overview')}
                className="text-gray-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Overview
              </button>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Users</h1>
            <p className="text-gray-400 text-sm">
              Manage users and view signups over time.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-zinc-700 hover:bg-zinc-800"
              onClick={() => cloudActions.setCurrentView('auth-settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Auth settings
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Signups Chart */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-semibold">Signups</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {totalSignupsInPeriod} {totalSignupsInPeriod === 1 ? 'signup' : 'signups'} in the selected period
                </p>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {state.loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">Loading...</div>
              </div>
            ) : (
              <SignupChart data={chartData} />
            )}
          </div>

          {/* Users Section */}
          <div>
            <div className="mb-4">
              <h2 className="text-white font-semibold text-lg mb-2">Users</h2>
              <p className="text-gray-400 text-sm">View and manage individual users.</p>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center justify-between mb-4">
              {/* <Button
                variant="outline"
                className="border-zinc-700 hover:bg-zinc-800"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button> */}

              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search by email, phone, or ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Users Table */}
            {state.loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">Loading users...</div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
                <UsersIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">
                  {searchQuery ? 'No users found' : 'No users yet'}
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search query'
                    : 'Users who sign up will appear here'
                  }
                </p>
                {!searchQuery && (
                  <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite user
                  </Button>
                )}
              </div>
            ) : (
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <table className="w-full">
                  <thead className="border-b border-zinc-800 bg-zinc-900">
                    <tr>
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-3">Name</th>
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-3">Login methods</th>
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-3">Last signed in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/50 cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(user.id)}`}>
                              {getUserInitial(user.email)}
                            </div>
                            <span className="text-white">{user.email || user.phone || user.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white">
                          {getLoginMethods(user.providers)}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {formatRelativeTime(user.lastSignInAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
