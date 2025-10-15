'use client';

import React from 'react';
import { useStore } from '@nanostores/react';
import { cloudStore, cloudActions } from '@/lib/stores/cloud';
import { HardDrive, Folder } from 'lucide-react';

interface StorageViewProps {
  chatId: string;
}

export default function StorageView({ chatId }: StorageViewProps) {
  const state = useStore(cloudStore);

  // Format date as YYYY/MM/DD
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // Handle bucket click
  const handleBucketClick = (bucketName: string) => {
    cloudActions.selectBucket(chatId, bucketName);
  };

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Storage</h1>
        <p className="text-gray-400 text-base">
          View and manage the files stored in your app.
        </p>
      </div>

      {/* Buckets List */}
      {state.loadingBuckets ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-gray-400">Loading buckets...</div>
        </div>
      ) : state.buckets.length === 0 ? (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-16 text-center">
          <HardDrive className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">No storage buckets yet</h3>
          <p className="text-gray-400 text-sm">
            Create a bucket to start storing files, images, and documents
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {state.buckets.map((bucket) => (
            <div
              key={bucket.id}
              onClick={() => handleBucketClick(bucket.name)}
              className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800/80 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Folder className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-lg font-semibold mb-1">{bucket.name}</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400">
                      Updated {bucket.createdAt ? formatDate(bucket.createdAt) : 'N/A'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      bucket.public 
                        ? 'bg-orange-500/20 text-orange-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {bucket.public ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

