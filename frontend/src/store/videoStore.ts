import { create } from 'zustand';

export interface VideoFile {
  id: string;
  name: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  format: string;
  url: string;
}

export interface ProcessingJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  outputUrl?: string;
  error?: string;
}

export interface ProcessingSettings {
  format: 'mp4' | 'webm' | 'gif';
  quality: 'high' | 'medium' | 'low';
  trim?: {
    start: number;
    duration: number;
  };
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  scale?: {
    width: number;
    height: number;
  };
  speed: number;
  effects: string[];
}

interface VideoStore {
  // State
  currentFile: VideoFile | null;
  processingJob: ProcessingJob | null;
  settings: ProcessingSettings;
  isUploading: boolean;
  uploadProgress: number;
  
  // Actions
  setCurrentFile: (file: VideoFile | null) => void;
  setProcessingJob: (job: ProcessingJob | null) => void;
  updateJobProgress: (progress: number) => void;
  updateJobStatus: (status: ProcessingJob['status'], outputUrl?: string, error?: string) => void;
  setSettings: (settings: Partial<ProcessingSettings>) => void;
  setUploading: (uploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  reset: () => void;
}

const defaultSettings: ProcessingSettings = {
  format: 'mp4',
  quality: 'medium',
  speed: 1,
  effects: [],
};

export const useVideoStore = create<VideoStore>((set, get) => ({
  // Initial state
  currentFile: null,
  processingJob: null,
  settings: defaultSettings,
  isUploading: false,
  uploadProgress: 0,

  // Actions
  setCurrentFile: (file) => set({ currentFile: file }),

  setProcessingJob: (job) => set({ processingJob: job }),

  updateJobProgress: (progress) => set((state) => ({
    processingJob: state.processingJob ? {
      ...state.processingJob,
      progress
    } : null
  })),

  updateJobStatus: (status, outputUrl, error) => set((state) => ({
    processingJob: state.processingJob ? {
      ...state.processingJob,
      status,
      ...(outputUrl && { outputUrl }),
      ...(error && { error })
    } : null
  })),

  setSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),

  setUploading: (uploading) => set({ isUploading: uploading }),

  setUploadProgress: (progress) => set({ uploadProgress: progress }),

  reset: () => set({
    currentFile: null,
    processingJob: null,
    settings: defaultSettings,
    isUploading: false,
    uploadProgress: 0,
  }),
}));
