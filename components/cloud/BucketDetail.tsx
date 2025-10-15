'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { cloudStore, cloudActions } from '@/lib/stores/cloud';
import { ChevronLeft, RefreshCw, Folder, File, Download, Copy, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/shadui/button';

interface BucketDetailViewProps {
  chatId: string;
}

export default function BucketDetailView({ chatId }: BucketDetailViewProps) {
  const state = useStore(cloudStore);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>('');

  const { selectedBucket, bucketFiles, loadingBucketFiles, selectedFile, currentProject } = state;

  useEffect(() => {
    if (selectedBucket) {
      cloudActions.loadBucketFiles(chatId, selectedBucket);
    }
  }, [chatId, selectedBucket]);

  // Generate file URL when file is selected
  useEffect(() => {
    if (selectedFile && currentProject?.projectId && selectedBucket) {
      const url = `https://${currentProject.projectId}.supabase.co/storage/v1/object/public/${selectedBucket}/${selectedFile.name}`;
      setFileUrl(url);
    } else {
      setFileUrl('');
    }
  }, [selectedFile, currentProject, selectedBucket]);

  const handleRefresh = async () => {
    if (!selectedBucket) return;
    setIsRefreshing(true);
    await cloudActions.loadBucketFiles(chatId, selectedBucket);
    setIsRefreshing(false);
  };

  const handleBack = () => {
    cloudActions.setCurrentView('storage');
  };

  const handleFileClick = (file: any) => {
    if (file.isFolder) return;
    cloudActions.selectFile(file);
  };

  const handleCloseDetail = () => {
    cloudActions.selectFile(null);
  };

  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const handleCopyUrl = async () => {
    if (fileUrl) {
      await navigator.clipboard.writeText(fileUrl);
    }
  };

  if (!selectedBucket) {
    return (
      <div className="p-6">
        <div className="text-gray-400">No bucket selected</div>
      </div>
    );
  }

  // Format file size
  const formatSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  };

  // Check if file is an image
  const isImage = (mimeType?: string) => {
    return mimeType?.startsWith('image/') || false;
  };

  // Get file type from mime type
  const getFileType = (mimeType?: string) => {
    if (!mimeType) return '-';
    return mimeType.split('/')[0] || '-';
  };

  // Calculate total size
  const totalSize = bucketFiles.reduce((sum, file) => sum + (file.size || 0), 0);
  const fileCount = bucketFiles.filter(f => !f.isFolder).length;

  return (
    <div className="h-full flex bg-black">
      {/* Left side - File list */}
      <div className={`flex flex-col bg-black ${selectedFile ? 'w-[400px] border-r border-zinc-800' : 'flex-1'}`}>
        {/* Header with back button */}
        <div className="border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2 px-6 py-3">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Storage
            </Button>
          </div>
        </div>

        {!selectedFile && (
          <>
            {/* Page header */}
            <div className="px-8 py-6 border-b border-zinc-800">
              <h1 className="text-3xl font-bold text-white mb-2">
                {selectedBucket}
              </h1>
              <p className="text-gray-400 text-base">
                View and manage files stored in this bucket.
              </p>
            </div>
          </>
        )}

        {/* Action bar with bucket name and reload button */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div 
            onClick={handleCloseDetail}
            className="text-white font-medium text-sm cursor-pointer hover:text-gray-300 transition-colors"
          >
            {selectedBucket}
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || loadingBucketFiles}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-auto">
          {loadingBucketFiles ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-gray-400">Loading files...</div>
            </div>
          ) : bucketFiles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No files in this bucket
            </div>
          ) : (
            <div className="divide-y divide-zinc-900">
              {bucketFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  className={`px-6 py-3 flex items-center gap-3 transition-colors ${
                    !file.isFolder ? 'cursor-pointer hover:bg-zinc-950/50' : ''
                  } ${
                    selectedFile?.id === file.id ? 'bg-blue-600/20 border-l-2 border-blue-600' : ''
                  }`}
                >
                  {file.isFolder ? (
                    <Folder className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : isImage(file.type) ? (
                    <ImageIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="text-white text-sm truncate">{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with file count and total size */}
        <div className="border-t border-zinc-800 px-6 py-3 bg-zinc-950/50">
          <div className="text-xs text-gray-400">
            {formatSize(totalSize)} for {fileCount} {fileCount === 1 ? 'file' : 'files'}
          </div>
        </div>
      </div>

      {/* Right side - File details */}
      {selectedFile && (
        <div className="flex-1 flex flex-col bg-black">
          {/* Header */}
          <div className="border-b border-zinc-800 bg-zinc-950 px-6 py-3 flex items-center justify-between">
            <h2 className="text-white font-medium">File Details</h2>
            <Button
              onClick={handleCloseDetail}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-8">
            {/* File preview */}
            {isImage(selectedFile.type) && fileUrl && (
              <div className="mb-8 border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
                <img 
                  src={fileUrl} 
                  alt={selectedFile.name}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* File info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">{selectedFile.name}</h3>
                <p className="text-gray-400">
                  {selectedFile.type || '-'} - {formatSize(selectedFile.size)}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Last modified</h4>
                <p className="text-white">{formatDate(selectedFile.lastModified)}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Created on</h4>
                <p className="text-white">{formatDate(selectedFile.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="border-t border-zinc-800 p-6 flex gap-3">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1 border-zinc-700 hover:bg-zinc-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={handleCopyUrl}
              variant="outline"
              className="flex-1 border-zinc-700 hover:bg-zinc-800"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy URL
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

