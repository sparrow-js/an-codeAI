import React from 'react';
import { X, Loader2 } from 'lucide-react';

interface FilePreviewProps {
  files: File[];
  imageDataList: string[];
  loadingStates: boolean[];
  onRemove: (index: number) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ files, imageDataList, loadingStates, onRemove }) => {
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-row overflow-x-auto p-2 -mt-2">
      {files.map((file, index) => (
        <div key={file.name + file.size} className="mr-2 relative">
          <div className="relative pt-4 pr-4">
            {loadingStates[index] ? (
              <div className="h-16 w-16 bg-gray-700/30 backdrop-blur-sm rounded-lg border border-gray-600/30 flex items-center justify-center transition-all duration-200">
                <Loader2 className="w-6 h-6 text-purple-400/70 animate-spin" />
              </div>
            ) : (
              imageDataList[index] && (
                <>
                  <img src={imageDataList[index]} alt={file.name} className="h-16 w-16 object-cover rounded-lg" />
                  <button
                    onClick={() => onRemove(index)}
                    className="absolute top-1 right-1 z-10 bg-black rounded-full w-5 h-5 shadow-md hover:bg-gray-900 transition-colors flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-gray-200" />
                  </button>
                </>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FilePreview;
