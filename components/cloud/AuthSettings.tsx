'use client';

import React from 'react';
import { ArrowLeft, Mail, Phone, ChevronRight, ChevronDown, Trash2, Plus } from 'lucide-react';
import { cloudActions } from '@/lib/stores/cloud';
import { Switch } from '@/components/shadui/switch';
import { Input } from '@/components/shadui/input';
import { Button } from '@/components/shadui/button';

interface AuthSettingsProps {
  chatId: string;
}

interface AllowedUrl {
  id: string;
  url: string;
  label?: string;
}

export default function AuthSettings({ chatId }: AuthSettingsProps) {
  const [disableSignup, setDisableSignup] = React.useState(false);
  const [enableAnonymous, setEnableAnonymous] = React.useState(false);
  const [advancedExpanded, setAdvancedExpanded] = React.useState(false);
  const [siteUrl, setSiteUrl] = React.useState('https://your-app.com');
  const [allowedUrls, setAllowedUrls] = React.useState<AllowedUrl[]>([
    { id: '1', url: 'https://your-app.com/**', label: 'Production' }
  ]);
  const [newUrl, setNewUrl] = React.useState('https://your-app.com/callback/**');

  const handleAddUrl = () => {
    if (newUrl.trim()) {
      setAllowedUrls([...allowedUrls, { id: Date.now().toString(), url: newUrl }]);
      setNewUrl('');
    }
  };

  const handleDeleteUrl = (id: string) => {
    setAllowedUrls(allowedUrls.filter(url => url.id !== id));
  };

  return (
    <div className="h-[calc(100vh-145px)] flex flex-col bg-black">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => cloudActions.setCurrentView('users')}
              className="text-gray-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Users
            </button>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Auth</h1>
          <p className="text-gray-400 text-sm">
            Configure how users sign in to your app
          </p>
        </div>
      </div>

      {/* Content - Scrollable area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Sign in methods */}
          <div>
            <h2 className="text-white font-semibold text-lg mb-4">Sign in methods</h2>
            
            <div className="space-y-3">
              {/* Email */}
              <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 hover:bg-zinc-800/50 cursor-pointer transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">Email</h3>
                      <p className="text-sm text-gray-400">Allow users to sign in with their email address</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-green-500 font-medium">Enabled</span>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Phone */}
              {/* <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 hover:bg-zinc-800/50 cursor-pointer transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">Phone</h3>
                      <p className="text-sm text-gray-400">Allow users to sign in with their phone number</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 font-medium">Disabled</span>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div> */}

              {/* Google */}
              {/* <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 hover:bg-zinc-800/50 cursor-pointer transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">Google</h3>
                      <p className="text-sm text-gray-400">Allow users to sign in with their Google account</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 font-medium">Disabled</span>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div> */}
            </div>
          </div>

          {/* Disable Sign-up */}
          {/* <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">Disable Sign-up</h3>
                <p className="text-sm text-gray-400">Prevent new users from signing up</p>
              </div>
              <Switch
                checked={disableSignup}
                onCheckedChange={setDisableSignup}
              />
            </div>
          </div> */}

          {/* Enable Anonymous Users */}
          {/* <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">Enable Anonymous Users</h3>
                <p className="text-sm text-gray-400">Allow anonymous users to sign in</p>
              </div>
              <Switch
                checked={enableAnonymous}
                onCheckedChange={setEnableAnonymous}
              />
            </div>
          </div> */}

          {/* Advanced */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
            {/* Advanced Header */}
            <div 
              className="p-6 hover:bg-zinc-800/50 cursor-pointer transition-colors"
              onClick={() => setAdvancedExpanded(!advancedExpanded)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Advanced</h3>
                {advancedExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                )}
              </div>
            </div>

            {/* Advanced Content */}
            {advancedExpanded && (
              <div className="px-6 pb-6 space-y-6 border-t border-zinc-800 pt-6">
                {/* Site URL */}
                <div>
                  <h4 className="text-white font-semibold mb-2">Site URL</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Default redirect URL when a redirect URL is not specified
                  </p>
                  <Input
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white focus:border-zinc-600"
                    placeholder="https://your-app.com"
                  />
                </div>

                {/* URI Allow List */}
                <div>
                  <h4 className="text-white font-semibold mb-2">URI Allow List</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    URLs that auth providers are permitted to redirect to post authentication
                  </p>

                  {/* Allowed URLs label */}
                  <div className="mb-3">
                    <label className="text-sm text-gray-400">Allowed URLs</label>
                  </div>

                  {/* URL List */}
                  <div className="space-y-2">
                    {allowedUrls.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-zinc-800 rounded-lg p-3 border border-zinc-700"
                      >
                        <div className="flex-1 flex items-center gap-2">
                          <code className="text-white font-mono text-sm">{item.url}</code>
                          {item.label && (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-xs font-medium rounded border border-emerald-500/20">
                              {item.label}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteUrl(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* Add New URL Input */}
                    <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-3 border border-zinc-700">
                      <input
                        type="text"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddUrl();
                          }
                        }}
                        className="flex-1 bg-transparent text-white font-mono text-sm outline-none placeholder:text-gray-500"
                        placeholder="https://your-app.com/callback/**"
                      />
                      <button
                        onClick={handleAddUrl}
                        className="text-gray-400 hover:text-emerald-500 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

