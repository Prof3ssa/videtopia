'use client';

import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { useVideoStore } from '@/store/videoStore';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

export const VideoPlayer = () => {
  const { currentFile } = useVideoStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const resetVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  if (!currentFile) {
    return (
      <div className="w-full h-48 sm:h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No video selected</p>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={currentFile.url}
        className="w-full h-auto max-h-96 sm:max-h-none"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onClick={togglePlay}
      />
      
      {/* Controls overlay */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-4 transition-opacity",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        {/* Timeline */}
        <div className="mb-2 sm:mb-4">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #6b7280 ${(currentTime / duration) * 100}%, #6b7280 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-white mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isPlaying ? <Pause size={18} className="sm:w-5 sm:h-5" /> : <Play size={18} className="sm:w-5 sm:h-5" />}
            </button>
            
            <button
              onClick={resetVideo}
              className="text-white hover:text-blue-400 transition-colors"
            >
              <RotateCcw size={14} className="sm:w-4 sm:h-4" />
            </button>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isMuted ? <VolumeX size={14} className="sm:w-4 sm:h-4" /> : <Volume2 size={14} className="sm:w-4 sm:h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-12 sm:w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-blue-400 transition-colors"
          >
            <Maximize size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Video info overlay */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-black/50 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm">
        {currentFile.width} × {currentFile.height} • {formatTime(duration)}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 10px;
          width: 10px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 10px;
          width: 10px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};
