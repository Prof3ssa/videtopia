'use client';

import { Toaster } from 'react-hot-toast';
import { VideoUploader } from '@/components/VideoUploader';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ProcessingControls } from '@/components/ProcessingControls';
import { ProgressModal } from '@/components/ProgressModal';
import { useVideoStore } from '@/store/videoStore';

export default function Home() {
  const { currentFile } = useVideoStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                Videtopia
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">
                Fast, modern video processing for meme creation and social media
              </p>
            </div>
            <div className="flex items-center space-x-4 ml-4">
              <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                Powered by FFmpeg
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Upload and Player */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Upload Section */}
            {!currentFile && (
              <div className="bg-white rounded-lg border p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Upload Your Video</h2>
                <VideoUploader />
              </div>
            )}

            {/* Video Player */}
            {currentFile && (
              <div className="bg-white rounded-lg border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold">Video Preview</h2>
                  <button
                    onClick={() => useVideoStore.getState().reset()}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap"
                  >
                    Upload New Video
                  </button>
                </div>
                <VideoPlayer />
                
                {/* File Info */}
                <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="min-w-0">
                      <span className="text-gray-500 block">Name:</span>
                      <p className="font-medium truncate">{currentFile.name}</p>
                    </div>
                    <div className="min-w-0">
                      <span className="text-gray-500 block">Size:</span>
                      <p className="font-medium truncate">{currentFile.size} bytes</p>
                    </div>
                    <div className="min-w-0">
                      <span className="text-gray-500 block">Duration:</span>
                      <p className="font-medium truncate">{currentFile.duration}s</p>
                    </div>
                    <div className="min-w-0">
                      <span className="text-gray-500 block">Resolution:</span>
                      <p className="font-medium truncate">{currentFile.width} × {currentFile.height}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Processing Controls */}
          <div className="xl:col-span-1">
            {currentFile ? (
              <ProcessingControls />
            ) : (
              <div className="bg-white rounded-lg border p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-xs flex-shrink-0">
                      1
                    </div>
                    <p className="text-xs sm:text-sm">Upload your video file (MP4, MOV, AVI, WebM, MKV, FLV)</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-xs flex-shrink-0">
                      2
                    </div>
                    <p className="text-xs sm:text-sm">Configure processing options like format, quality, and effects</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-xs flex-shrink-0">
                      3
                    </div>
                    <p className="text-xs sm:text-sm">Process your video and download the result</p>
                  </div>
                </div>
                
                <div className="mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 text-sm">Supported Features</h4>
                  <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                    <li>• Video compression and format conversion</li>
                    <li>• Trimming and cropping</li>
                    <li>• Speed adjustment</li>
                    <li>• Visual effects and filters</li>
                    <li>• GIF creation</li>
                    <li>• Social media presets</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Progress Modal */}
      <ProgressModal />
    </div>
  );
}
