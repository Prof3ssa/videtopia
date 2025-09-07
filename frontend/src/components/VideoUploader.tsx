'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Video, FileVideo } from 'lucide-react';
import { useVideoStore } from '@/store/videoStore';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';
import { validateVideoFile, formatFileSize } from '@/lib/utils';
import { cn } from '@/lib/utils';

export const VideoUploader = () => {
  const { uploadVideo } = useVideoProcessing();
  const { isUploading, uploadProgress } = useVideoStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validation = validateVideoFile(file);
    if (!validation.valid) {
      // Handle validation error
      return;
    }

    await uploadVideo(file);
  }, [uploadVideo]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv']
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          "hover:border-blue-500 hover:bg-blue-50/50",
          isDragActive && "border-blue-500 bg-blue-50",
          isDragReject && "border-red-500 bg-red-50",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {isUploading ? (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">Uploading...</p>
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">{uploadProgress}%</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                {isDragActive ? (
                  <Video className="w-8 h-8 text-blue-600" />
                ) : (
                  <FileVideo className="w-8 h-8 text-gray-600" />
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop your video here' : 'Upload your video'}
                </p>
                <p className="text-sm text-gray-500">
                  Drag and drop your video file here, or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  Supports MP4, MOV, AVI, WebM, MKV, FLV • Max 100MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
