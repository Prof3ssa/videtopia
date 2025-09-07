export interface VideoFile {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  format: string;
  uploadedAt: Date;
}

export interface ProcessingJob {
  id: string;
  fileId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  operations: ProcessingOperations;
  outputPath?: string;
  outputUrl?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessingOperations {
  format?: 'mp4' | 'webm' | 'gif';
  quality?: 'high' | 'medium' | 'low' | number;
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
  speed?: number;
  effects?: string[];
}

export interface FFmpegCommand {
  input: string;
  output: string;
  filters: string[];
  codec: string;
  preset: string;
  bitrate?: string;
}

export interface UploadResponse {
  file_id: string;
  duration: number;
  dimensions: {
    width: number;
    height: number;
  };
  format: string;
}

export interface ProcessResponse {
  job_id: string;
}

export interface StatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  output_url?: string;
  error?: string;
}
