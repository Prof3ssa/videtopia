import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { VideoFile, ProcessingJob, ProcessingOperations } from '../types';
import { FFmpegProcessor } from '../utils/ffmpeg';

class VideoService {
  private jobs: Map<string, ProcessingJob> = new Map();
  private files: Map<string, VideoFile> = new Map();
  private uploadDir: string;
  private outputDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    this.outputDir = process.env.OUTPUT_DIR || path.join(process.cwd(), 'outputs');
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  async saveUploadedFile(
    originalName: string,
    filePath: string,
    fileSize: number
  ): Promise<VideoFile> {
    const fileId = uuidv4();
    const fileExtension = path.extname(originalName);
    const filename = `${fileId}${fileExtension}`;
    const finalPath = path.join(this.uploadDir, filename);

    // Since multer now saves directly to uploads directory, we just need to rename
    // the file to our UUID-based filename
    await fs.rename(filePath, finalPath);

    // Get video information
    const videoInfo = await FFmpegProcessor.getVideoInfo(finalPath);

    const videoFile: VideoFile = {
      id: fileId,
      originalName,
      filename,
      path: finalPath,
      size: fileSize,
      duration: videoInfo.duration,
      width: videoInfo.width,
      height: videoInfo.height,
      format: videoInfo.format,
      uploadedAt: new Date()
    };

    this.files.set(fileId, videoFile);
    return videoFile;
  }

  async createProcessingJob(
    fileId: string,
    operations: ProcessingOperations
  ): Promise<ProcessingJob> {
    const file = this.files.get(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    const jobId = uuidv4();
    const job: ProcessingJob = {
      id: jobId,
      fileId,
      status: 'pending',
      progress: 0,
      operations,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.jobs.set(jobId, job);

    // Start processing asynchronously
    this.processJob(jobId).catch(error => {
      console.error(`Job ${jobId} failed:`, error);
      const failedJob = this.jobs.get(jobId);
      if (failedJob) {
        failedJob.status = 'failed';
        failedJob.error = error.message;
        failedJob.updatedAt = new Date();
      }
    });

    return job;
  }

  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    const file = this.files.get(job.fileId);
    if (!file) {
      throw new Error('File not found');
    }

    try {
      // Update status to processing
      job.status = 'processing';
      job.updatedAt = new Date();

      // Determine output format and extension
      const outputFormat = job.operations.format || 'mp4';
      const outputExtension = outputFormat === 'gif' ? '.gif' : `.${outputFormat}`;
      const outputFilename = `${jobId}${outputExtension}`;
      const outputPath = path.join(this.outputDir, outputFilename);

      // Process video
      await FFmpegProcessor.processVideo(
        file.path,
        outputPath,
        job.operations,
        (progress) => {
          job.progress = progress;
          job.updatedAt = new Date();
        }
      );

      // Update job with success
      job.status = 'completed';
      job.progress = 100;
      job.outputPath = outputPath;
      job.outputUrl = `/api/download/${jobId}`;
      job.updatedAt = new Date();

    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.updatedAt = new Date();
      throw error;
    }
  }

  getJob(jobId: string): ProcessingJob | undefined {
    return this.jobs.get(jobId);
  }

  getFile(fileId: string): VideoFile | undefined {
    return this.files.get(fileId);
  }

  async cleanupOldFiles(maxAge: number = 30 * 60 * 1000): Promise<void> {
    const now = new Date();
    let deletedFiles = 0;
    let deletedOutputs = 0;
    
    // Clean up old uploaded files
    for (const [fileId, file] of this.files.entries()) {
      if (now.getTime() - file.uploadedAt.getTime() > maxAge) {
        try {
          await fs.unlink(file.path);
          this.files.delete(fileId);
          deletedFiles++;
          console.log(`🗑️ Deleted old uploaded file: ${file.filename}`);
        } catch (error) {
          console.error(`Failed to delete file ${file.path}:`, error);
        }
      }
    }

    // Clean up old output files
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.outputPath && now.getTime() - job.updatedAt.getTime() > maxAge) {
        try {
          await fs.unlink(job.outputPath);
          job.outputPath = undefined;
          job.outputUrl = undefined;
          deletedOutputs++;
          console.log(`🗑️ Deleted old output file: ${jobId}`);
        } catch (error) {
          console.error(`Failed to delete output file ${job.outputPath}:`, error);
        }
      }
    }

    if (deletedFiles > 0 || deletedOutputs > 0) {
      console.log(`🧹 Cleanup completed: ${deletedFiles} uploaded files, ${deletedOutputs} output files deleted`);
    }
  }

  async getOutputFilePath(jobId: string): Promise<string | null> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'completed' || !job.outputPath) {
      return null;
    }

    try {
      await fs.access(job.outputPath);
      return job.outputPath;
    } catch {
      return null;
    }
  }
}

export const videoService = new VideoService();
