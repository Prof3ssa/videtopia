import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedTypes = [
    'video/mp4',
    'video/mov',
    'video/avi',
    'video/webm',
    'video/mkv',
    'video/flv'
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 100MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type' };
  }

  return { valid: true };
}

export function getAspectRatioPresets() {
  return [
    { name: 'Original', ratio: null, width: null, height: null },
    { name: 'Square (1:1)', ratio: 1, width: 1080, height: 1080 },
    { name: 'Landscape (16:9)', ratio: 16/9, width: 1920, height: 1080 },
    { name: 'Portrait (9:16)', ratio: 9/16, width: 1080, height: 1920 },
    { name: 'Instagram (4:5)', ratio: 4/5, width: 1080, height: 1350 },
    { name: 'Twitter (1.91:1)', ratio: 1.91, width: 1200, height: 628 },
  ];
}

export function getQualityPresets() {
  return [
    { name: 'High', value: 'high', description: 'Best quality, larger file' },
    { name: 'Medium', value: 'medium', description: 'Good balance' },
    { name: 'Low', value: 'low', description: 'Smaller file, lower quality' },
  ];
}

export function getSpeedPresets() {
  return [
    { name: '0.5x', value: 0.5 },
    { name: '0.75x', value: 0.75 },
    { name: '1.25x', value: 1.25 },
    { name: '1.5x', value: 1.5 },
    { name: '2x', value: 2 },
  ];
}

export function getResolutionPresets() {
  return [
    { name: '4K', width: 3840, height: 2160 },
    { name: '1080p', width: 1920, height: 1080 },
    { name: '720p', width: 1280, height: 720 },
    { name: '480p', width: 854, height: 480 },
  ];
}
