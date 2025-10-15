import React, { useState, useEffect } from "react";
import { FiEdit2 } from "react-icons/fi";
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/shadui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/shadui/tabs";
import { useWorkspace } from "@/lib/hooks/useWorkspace";
import { useSession } from "next-auth/react";


import { Products } from "../products";

interface SettingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tabValue: string;
}

export default function SettingDialog({ open, onOpenChange, tabValue }: SettingDialogProps) {
  const { currentWorkspace, loading, error, fetchWorkspace } = useWorkspace();
  const { data: session } = useSession();
  
  // State for workspace info (initialize with real data)
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [workspaceDescription, setWorkspaceDescription] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>(tabValue);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [credits, setCredits] = useState<number>(0);
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [creditsLoading, setCreditsLoading] = useState<boolean>(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string>("");
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string>("");

  // Initialize workspace data when currentWorkspace changes
  useEffect(() => {
    if (currentWorkspace) {
      setWorkspaceName(currentWorkspace.name || "");
      setWorkspaceDescription(currentWorkspace.description || "");
      // Sync uploaded avatar URL with workspace icon when workspace data changes
      if (currentWorkspace.icon && !uploadedAvatarUrl) {
        setUploadedAvatarUrl("");
      }
    }
  }, [currentWorkspace, uploadedAvatarUrl]);

  // Clear local avatar state when dialog closes
  useEffect(() => {
    if (!open) {
      setUploadedAvatarUrl("");
      setAvatarUploadError("");
    }
  }, [open]);

  // Sync tabValue to activeTab
  useEffect(() => {
    if (tabValue) {
      setActiveTab(tabValue);
    }
  }, [tabValue]);

  // Fetch workspace data when dialog opens
  useEffect(() => {
    if (open && !currentWorkspace) {
      fetchWorkspace();
    }
  }, [open, currentWorkspace, fetchWorkspace]);

  // Fetch credits when billing tab is active
  const fetchCredits = async () => {
    if (!currentWorkspace?.id) return;
    
    setCreditsLoading(true);
    try {
      const response = await fetch(`/api/usage/get-credits?workspaceId=${currentWorkspace.id}`);
      if (!response.ok) throw new Error('Failed to fetch credits');
      const creditsData = await response.json();
      setCredits(creditsData.credits);
      setTotalCredits(creditsData.totalCredits);
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setCreditsLoading(false);
    }
  };

  // Fetch credits when billing tab becomes active
  useEffect(() => {
    if (activeTab === 'billing' && currentWorkspace?.id) {
      fetchCredits();
    }
  }, [activeTab, currentWorkspace?.id]);

  // Save workspace changes
  const saveWorkspaceChanges = async () => {
    if (!currentWorkspace?.id) return;

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/workspace', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
          name: workspaceName,
          description: workspaceDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save workspace');
      }

      setSaveSuccess(true);
      // Refresh workspace data
      await fetchWorkspace();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving workspace:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save workspace');
    } finally {
      setIsSaving(false);
    }
  };

  // Avatar is just the first letter of the workspace name
  const avatarInitial = (currentWorkspace?.name || workspaceName)?.[0]?.toUpperCase() || "M";

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    if (!currentWorkspace?.id) return;

    setIsUploadingAvatar(true);
    setAvatarUploadError("");

    try {
      // Upload file to /api/upload
      const formData = new FormData();
      formData.append('file', file);

      // Create a safe filename by using timestamp and file extension
      const fileExtension = file.name.split('.').pop() || 'png';
      const safeFilename = `avatar-${Date.now()}.${fileExtension}`;

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-vercel-filename': safeFilename,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadResult = await uploadResponse.json();
      setUploadedAvatarUrl(uploadResult.url);

      // Update workspace with new avatar URL
      const updateResponse = await fetch('/api/workspace', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
          icon: uploadResult.url,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update workspace avatar');
      }

      // Refresh workspace data
      await fetchWorkspace();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setAvatarUploadError(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleAvatarUpload(acceptedFiles[0]);
      }
    },
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setAvatarUploadError('File size must be less than 5MB');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setAvatarUploadError('Please upload a valid image file');
      } else {
        setAvatarUploadError('Invalid file');
      }
    },
    disabled: loading || isUploadingAvatar,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#18181b] border-zinc-700 w-[900px] max-w-[90vw] h-[90vh] p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex h-full min-h-0">
          {/* Left Sidebar - Vertical Tabs */}
          <TabsList className="flex-col h-full w-64 min-w-[200px] bg-[#0f0f10] border-r border-zinc-800 p-4 space-y-2 justify-start shrink-0 overflow-y-auto">
            {/* Workspace Section */}
            <div className="w-full mb-4">
              <h3 className="text-xs text-zinc-400 uppercase tracking-wide mb-2">Workspace</h3>
              <div className="flex items-center gap-2 p-2 bg-[#18181b] rounded-lg">
                <div className={`w-6 h-6 rounded text-white text-xs flex items-center justify-center font-medium ${
                  (uploadedAvatarUrl || currentWorkspace?.icon) ? 'bg-transparent' : 'bg-yellow-600'
                }`}>
                  {uploadedAvatarUrl ? (
                    <img 
                      src={uploadedAvatarUrl} 
                      alt="Workspace avatar" 
                      className="w-full h-full rounded object-cover"
                    />
                  ) : currentWorkspace?.icon ? (
                    <img 
                      src={currentWorkspace.icon} 
                      alt="Workspace avatar" 
                      className="w-full h-full rounded object-cover"
                    />
                  ) : (
                    avatarInitial
                  )}
                </div>
                <span className="text-white text-sm">{currentWorkspace?.name || workspaceName || "Loading..."}</span>
              </div>
            </div>

            <TabsTrigger 
              value="workspace" 
              className="w-full justify-start gap-2 p-2 h-auto bg-transparent text-zinc-400 hover:bg-[#18181b] data-[state=active]:bg-[#18181b] data-[state=active]:text-white"
            >
              <div className="w-4 h-4">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </div>
              <span>Workspace Settings</span>
            </TabsTrigger>

            {/* <TabsTrigger 
              value="people" 
              className="w-full justify-start gap-2 p-2 h-auto bg-transparent text-zinc-400 hover:bg-[#18181b] data-[state=active]:bg-[#18181b] data-[state=active]:text-white"
            >
              <div className="w-4 h-4">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <span>People</span>
            </TabsTrigger> */}

            <TabsTrigger 
              value="billing" 
              className="w-full justify-start gap-2 p-2 h-auto bg-transparent text-zinc-400 hover:bg-[#18181b] data-[state=active]:bg-[#18181b] data-[state=active]:text-white"
            >
              <div className="w-4 h-4">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span>Plans & Billing</span>
            </TabsTrigger>

            {/* Account Section */}
            <div className="w-full mt-4 mb-2">
              <h3 className="text-xs text-zinc-400 uppercase tracking-wide mb-2">Account</h3>
            </div>

            <TabsTrigger 
              value="account" 
              className="w-full justify-start gap-2 p-2 h-auto bg-transparent text-zinc-400 hover:bg-[#18181b] data-[state=active]:bg-[#18181b] data-[state=active]:text-white"
            >
              <div className="w-4 h-4">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              <span>{session?.user?.name || session?.user?.email || "User"}</span>
            </TabsTrigger>

            {/* <TabsTrigger 
              value="labs" 
              className="w-full justify-start gap-2 p-2 h-auto bg-transparent text-zinc-400 hover:bg-[#18181b] data-[state=active]:bg-[#18181b] data-[state=active]:text-white"
            >
              <div className="w-4 h-4">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 11H7v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9h-2m-4 0V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v5"/>
                </svg>
              </div>
              <span>Labs</span>
            </TabsTrigger> */}

            {/* Integrations Section */}
            {/* <div className="w-full mt-4 mb-2">
              <h3 className="text-xs text-zinc-400 uppercase tracking-wide mb-2">Integrations</h3>
            </div> */}

            <TabsTrigger 
              value="integrations" 
              className="w-full justify-start gap-2 p-2 h-auto bg-transparent text-zinc-400 hover:bg-[#18181b] data-[state=active]:bg-[#18181b] data-[state=active]:text-white"
            >
              <div className="w-4 h-4">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                </svg>
              </div>
              <span>Integrations</span>
            </TabsTrigger>
          </TabsList>

          {/* Right Content Area */}
          <div className="flex-1 p-0 overflow-hidden min-w-0">
            <TabsContent value="workspace" className="p-0 h-full overflow-y-auto">
              <div className="p-8 max-w-full">
              <DialogHeader className="mb-8">
                <DialogTitle className="text-lg font-bold text-white mb-1">
                  Workspace Settings
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Workspaces allow you to collaborate on projects in real time.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-8 max-w-full">
                {/* Workspace Avatar */}
                <div>
                  <h3 className="text-white text-sm font-medium mb-3">Workspace Avatar</h3>
                  <p className="text-zinc-400 text-xs mb-4">Set an avatar for your workspace. Click or drag an image to upload.</p>
                  
                  <div 
                    {...getRootProps()} 
                    className={`flex items-center gap-4 cursor-pointer transition-all duration-200 ${
                      isDragActive ? 'opacity-80' : ''
                    } ${isUploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <div className="relative group">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        isDragActive ? 'ring-2 ring-yellow-600 ring-offset-2 ring-offset-[#18181b]' : ''
                      } ${(uploadedAvatarUrl || currentWorkspace?.icon) ? 'bg-transparent' : 'bg-yellow-600'}`}>
                        {isUploadingAvatar ? (
                          <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : uploadedAvatarUrl ? (
                          <img 
                            src={uploadedAvatarUrl} 
                            alt="Workspace avatar" 
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : currentWorkspace?.icon ? (
                          <img 
                            src={currentWorkspace.icon} 
                            alt="Workspace avatar" 
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : loading ? (
                          <div className="animate-pulse w-6 h-6 bg-white/20 rounded"></div>
                        ) : (
                          <span className="text-white text-lg font-medium">{avatarInitial}</span>
                        )}
                      </div>
                      
                      {!isUploadingAvatar && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md group-hover:bg-gray-100 transition-colors">
                          <FiEdit2 className="w-3 h-3 text-gray-600" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-white text-sm font-medium">
                        {isUploadingAvatar ? 'Uploading...' : ''}
                      </p>
                    </div>
                  </div>
                  
                  {/* Avatar upload error */}
                  {avatarUploadError && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm">{avatarUploadError}</p>
                    </div>
                  )}
                </div>

                {/* Workspace Name */}
                <div className="px-1">
                  <h3 className="text-white text-sm font-medium mb-3">Workspace Name</h3>
                  <p className="text-zinc-400 text-xs mb-4">Your full workspace name, as visible to others.</p>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    disabled={loading || isSaving}
                    placeholder={loading ? "Loading..." : "Enter workspace name"}
                    className="w-full px-3 py-2 bg-[#0f0f10] border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-0 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Workspace Description */}
                <div className="px-1">
                  <h3 className="text-white text-sm font-medium mb-3">Workspace Description</h3>
                  <p className="text-zinc-400 text-xs mb-4">A short description about your workspace or team.</p>
                  <textarea
                    value={workspaceDescription}
                    onChange={(e) => setWorkspaceDescription(e.target.value)}
                    placeholder="Enter workspace description"
                    disabled={loading || isSaving}
                    className="w-full px-3 py-2 bg-[#0f0f10] border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-0 focus:border-transparent resize-none h-32 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: '#ffffff' }}
                  />
                </div>

                {/* Error and Success Display */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                {saveError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{saveError}</p>
                  </div>
                )}
                {saveSuccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-400 text-sm">Workspace updated successfully!</p>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-zinc-700">
                  <button
                    onClick={saveWorkspaceChanges}
                    disabled={loading || isSaving || !workspaceName.trim()}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
              </div>
            </TabsContent>

            {/* <TabsContent value="people" className="p-8 h-full">
              <DialogHeader className="mb-8">
                <DialogTitle className="text-lg font-bold text-white mb-1">
                  People
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Manage team members and their access to your workspace.
                </DialogDescription>
              </DialogHeader>
              <div className="text-white">
                <p>People management content will be shown here.</p>
              </div>
            </TabsContent> */}

            <TabsContent value="billing" className="p-0 h-full overflow-y-auto">
              <div className="p-8">
              <DialogHeader className="mb-8">
                <DialogTitle className="text-lg font-bold text-white mb-1">
                  Plans & Billing
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Manage your subscription and billing information.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Current Plan */}
                <div>
                  <h3 className="text-white text-sm font-medium mb-3">Current Plan</h3>
                  <div className="p-4 bg-[#0f0f10] border border-zinc-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white text-sm font-medium capitalize">
                          {currentWorkspace?.plan} Plan
                        </h4>
                        <p className="text-zinc-400 text-xs">
                          {currentWorkspace?.plan === 'FREE' ? 'Basic features included' : 'Premium features enabled'}
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-xs font-medium">
                        {currentWorkspace?.plan}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credits Usage */}
                <div>
                  <h3 className="text-white text-sm font-medium mb-3">Credits Usage</h3>
                  <div className="p-4 bg-[#0f0f10] border border-zinc-700 rounded-lg">
                    {creditsLoading ? (
                      <div className="text-zinc-400 text-sm">Loading credits...</div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400 text-sm">Remaining Credits</span>
                          <span className="text-white text-sm font-medium">{credits.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400 text-sm">Total Credits</span>
                          <span className="text-white text-sm font-medium">{totalCredits.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${totalCredits > 0 ? (credits) / totalCredits * 100 : 0}%` }}
                          ></div>
                        </div>
                        <p className="text-zinc-400 text-xs">
                          You have used {totalCredits > 0 ? ((totalCredits - credits) / totalCredits * 100).toFixed(1) : 0}% of your credits
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upgrade Section */}
                {currentWorkspace?.plan === 'free' && (
                  <div>
                    <h3 className="text-white text-sm font-medium mb-3">Upgrade Plan</h3>
                    <div className="p-4 bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border border-yellow-600/20 rounded-lg">
                      <h4 className="text-white text-sm font-medium mb-2">Upgrade to Pro</h4>
                      <Products />
                    </div>
                  </div>
                )}
              </div>
              </div>
            </TabsContent>

            <TabsContent value="account" className="p-0 h-full overflow-y-auto">
              <div className="p-8">
              <DialogHeader className="mb-8">
                <DialogTitle className="text-lg font-bold text-white mb-1">
                  Account Settings
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Manage your personal account settings.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* User Profile */}
                <div>
                  <h3 className="text-white text-sm font-medium mb-3">Profile Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        {session?.user?.image ? (
                          <img 
                            src={session.user.image} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-lg font-medium">
                            {(session?.user?.name || session?.user?.email || "U")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {session?.user?.name || "No name provided"}
                        </p>
                        <p className="text-zinc-400 text-xs">
                          {session?.user?.email || "No email provided"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Account Details */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-zinc-400 text-xs mb-2">Name</label>
                        <input
                          type="text"
                          value={session?.user?.name || ""}
                          disabled
                          className="w-full px-3 py-2 bg-[#0f0f10] border border-zinc-700 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-xs mb-2">Email</label>
                        <input
                          type="email"
                          value={session?.user?.email || ""}
                          disabled
                          className="w-full px-3 py-2 bg-[#0f0f10] border border-zinc-700 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </TabsContent>

            <TabsContent value="labs" className="p-8 h-full">
              <DialogHeader className="mb-8">
                <DialogTitle className="text-lg font-bold text-white mb-1">
                  Labs
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Experimental features and beta testing.
                </DialogDescription>
              </DialogHeader>
              <div className="text-white">
                <p>Labs and experimental features will be shown here.</p>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="p-0 h-full overflow-y-auto">
              <div className="p-8">
              <DialogHeader className="mb-8">
                <DialogTitle className="text-lg font-bold text-white mb-1">
                  Integrations
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Connect your workspace with external services.
                </DialogDescription>
              </DialogHeader>
              {/* <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-[#0f0f10] rounded-lg border border-zinc-700">
                  <div className="w-8 h-8 text-green-400">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white text-sm font-medium">Supabase</h4>
                    <p className="text-zinc-400 text-xs">Connected</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[#0f0f10] rounded-lg border border-zinc-700">
                  <div className="w-8 h-8 text-zinc-400">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white text-sm font-medium">GitHub</h4>
                    <p className="text-zinc-400 text-xs">Not connected</p>
                  </div>
                </div>
              </div> */}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
