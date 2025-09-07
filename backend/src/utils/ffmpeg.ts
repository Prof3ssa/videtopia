import ffmpeg from 'fluent-ffmpeg';
import { ProcessingOperations, FFmpegCommand } from '../types';

export class FFmpegProcessor {
  private static getQualitySettings(quality: 'high' | 'medium' | 'low' | number) {
    if (typeof quality === 'number') {
      return { crf: quality, preset: 'medium' };
    }
    
    switch (quality) {
      case 'high':
        return { crf: 18, preset: 'slow' };
      case 'medium':
        return { crf: 23, preset: 'medium' };
      case 'low':
        return { crf: 28, preset: 'fast' };
      default:
        return { crf: 23, preset: 'medium' };
    }
  }

  private static buildFilters(operations: ProcessingOperations, videoWidth?: number, videoHeight?: number): string[] {
    const filters: string[] = [];

    // Trim filter
    if (operations.trim) {
      filters.push(`trim=start=${operations.trim.start}:duration=${operations.trim.duration}`);
    }

    // Crop filter
    if (operations.crop) {
      const { x, y, width, height } = operations.crop;
      // Validate crop parameters
      if (width > 0 && height > 0 && x >= 0 && y >= 0) {
        // Ensure crop doesn't exceed video dimensions
        const maxWidth = videoWidth || width;
        const maxHeight = videoHeight || height;
        const validWidth = Math.min(width, maxWidth - x);
        const validHeight = Math.min(height, maxHeight - y);
        
        if (validWidth > 0 && validHeight > 0 && x < maxWidth && y < maxHeight) {
          filters.push(`crop=${validWidth}:${validHeight}:${x}:${y}`);
        }
      }
    }

    // Scale filter
    if (operations.scale) {
      filters.push(`scale=${operations.scale.width}:${operations.scale.height}`);
    }

    // Speed filter
    if (operations.speed && operations.speed !== 1) {
      filters.push(`setpts=${1/operations.speed}*PTS`);
    }

    // Effects filters
    if (operations.effects) {
      operations.effects.forEach((effect: string) => {
        switch (effect) {
          case 'reverse':
            filters.push('reverse');
            break;
          case 'blur':
            filters.push('boxblur=5:1');
            break;
          case 'sharpen':
            filters.push('unsharp=5:5:1.5:5:5:0');
            break;
          case 'brightness':
            filters.push('eq=brightness=0.1');
            break;
          case 'contrast':
            filters.push('eq=contrast=1.2');
            break;
        }
      });
    }

    return filters;
  }

  static generateCommand(inputPath: string, outputPath: string, operations: ProcessingOperations, videoWidth?: number, videoHeight?: number): FFmpegCommand {
    const quality = this.getQualitySettings(operations.quality || 'medium');
    const filters = this.buildFilters(operations, videoWidth, videoHeight);
    
    let codec = 'libx264';
    let preset = quality.preset;
    let audioCodec = 'aac';
    let audioBitrate = '128k';

    // Format-specific settings
    switch (operations.format) {
      case 'webm':
        codec = 'libvpx-vp9';
        audioCodec = 'libopus';
        audioBitrate = '96k';
        break;
      case 'gif':
        codec = 'gif';
        audioCodec = 'none';
        break;
      default: // mp4
        codec = 'libx264';
        audioCodec = 'aac';
        break;
    }

    return {
      input: inputPath,
      output: outputPath,
      filters,
      codec,
      preset,
      bitrate: quality.crf ? `-crf ${quality.crf}` : undefined
    };
  }

  static async processVideo(
    inputPath: string, 
    outputPath: string, 
    operations: ProcessingOperations,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Get video dimensions for crop validation
        const videoInfo = await this.getVideoInfo(inputPath);
        
        const command = ffmpeg(inputPath);
        const ffmpegCommand = this.generateCommand(inputPath, outputPath, operations, videoInfo.width, videoInfo.height);

        // Log the command for debugging
        console.log('FFmpeg command:', {
          input: inputPath,
          output: outputPath,
          filters: ffmpegCommand.filters,
          codec: ffmpegCommand.codec,
          preset: ffmpegCommand.preset,
          operations,
          videoDimensions: { width: videoInfo.width, height: videoInfo.height }
        });

        // Set video codec
        command.videoCodec(ffmpegCommand.codec);

        // Set audio codec (if not gif)
        if (operations.format !== 'gif') {
          command.audioCodec('aac');
          command.audioBitrate('128k');
        } else {
          command.noAudio();
        }

        // Set preset
        if (ffmpegCommand.preset) {
          command.addOutputOptions(['-preset', ffmpegCommand.preset]);
        }

        // Set quality
        if (ffmpegCommand.bitrate) {
          command.addOutputOptions(ffmpegCommand.bitrate.split(' '));
        }

        // Apply filters
        if (ffmpegCommand.filters.length > 0) {
          command.videoFilters(ffmpegCommand.filters);
        }

        // Handle audio speed changes
        if (operations.speed && operations.speed !== 1 && operations.format !== 'gif') {
          command.audioFilters(`atempo=${Math.min(2.0, Math.max(0.5, operations.speed))}`);
        }

        // Progress tracking
        command.on('progress', (progress: any) => {
          if (onProgress && progress.percent) {
            onProgress(Math.round(progress.percent));
          }
        });

        // Error handling
        command.on('error', (err: Error) => {
          console.error('FFmpeg error details:', err);
          reject(new Error(`FFmpeg error: ${err.message}`));
        });

        // Success handling
        command.on('end', () => {
          console.log('FFmpeg processing completed successfully');
          resolve();
        });

        // Start processing
        command.save(outputPath);
      } catch (error) {
        console.error('Error getting video info:', error);
        reject(error);
      }
    });
  }

  static async getVideoInfo(inputPath: string): Promise<{
    duration: number;
    width: number;
    height: number;
    format: string;
    size: number;
  }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err: Error, metadata: any) => {
        if (err) {
          reject(new Error(`FFprobe error: ${err.message}`));
          return;
        }

        const videoStream = metadata.streams.find((stream: any) => stream.codec_type === 'video');
        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          format: metadata.format.format_name || 'unknown',
          size: metadata.format.size || 0
        });
      });
    });
  }
}
