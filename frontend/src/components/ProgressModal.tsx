'use client';

import { X, Download, AlertCircle } from 'lucide-react';
import { useVideoStore } from '@/store/videoStore';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';
import { cn } from '@/lib/utils';

export const ProgressModal = () => {
  const { processingJob } = useVideoStore();
  const { downloadProcessedVideo } = useVideoProcessing();

  const handleDownload = async () => {
    if (processingJob?.id) {
      await downloadProcessedVideo(processingJob.id);
    }
  };

  const handleClose = () => {
    // Reset the job when closing
    useVideoStore.getState().setProcessingJob(null);
  };

  if (!processingJob) return null;

  const getStatusIcon = () => {
    switch (processingJob.status) {
      case 'pending':
        return <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'processing':
        return <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full" />
        </div>;
      case 'failed':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (processingJob.status) {
      case 'pending':
        return 'Preparing to process...';
      case 'processing':
        return 'Processing your video...';
      case 'completed':
        return 'Processing completed!';
      case 'failed':
        return 'Processing failed';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (processingJob.status) {
      case 'pending':
      case 'processing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Video Processing
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-3 mb-6">
          {getStatusIcon()}
          <span className={cn("font-medium", getStatusColor())}>
            {getStatusText()}
          </span>
        </div>

        {/* Progress Bar */}
        {processingJob.status === 'processing' && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{processingJob.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingJob.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {processingJob.status === 'failed' && processingJob.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{processingJob.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {processingJob.status === 'completed' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              Your video has been processed successfully! You can now download it.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {processingJob.status === 'completed' && (
            <button
              onClick={handleDownload}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download size={16} />
              <span>Download</span>
            </button>
          )}
          
          <button
            onClick={handleClose}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              processingJob.status === 'completed'
                ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            {processingJob.status === 'completed' ? 'Close' : 'Cancel'}
          </button>
        </div>

        {/* Processing Info */}
        {processingJob.status === 'processing' && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>This may take a few minutes depending on your video size and settings.</p>
            <p className="mt-1">Please don&apos;t close this window.</p>
          </div>
        )}
      </div>
    </div>
  );
};
