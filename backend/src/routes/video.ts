import { Router, Request, Response } from 'express';
import { upload, handleUploadError, validateVideoFile } from '../middleware/upload';
import { videoService } from '../services/videoService';
import { ProcessingOperations } from '../types';

const router = Router();

// Upload video file
router.post('/upload', 
  upload.single('video'),
  handleUploadError,
  validateVideoFile,
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const videoFile = await videoService.saveUploadedFile(
        req.file.originalname,
        req.file.path,
        req.file.size
      );

      res.json({
        file_id: videoFile.id,
        duration: videoFile.duration,
        dimensions: {
          width: videoFile.width,
          height: videoFile.height
        },
        format: videoFile.format
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Start video processing
router.post('/process', async (req: Request, res: Response) => {
  try {
    const { file_id, operations } = req.body;

    if (!file_id) {
      return res.status(400).json({ error: 'file_id is required' });
    }

    if (!operations || typeof operations !== 'object') {
      return res.status(400).json({ error: 'operations object is required' });
    }

    // Validate operations
    const validOperations: ProcessingOperations = {};
    
    if (operations.format && ['mp4', 'webm', 'gif'].includes(operations.format)) {
      validOperations.format = operations.format;
    }
    
    if (operations.quality) {
      if (['high', 'medium', 'low'].includes(operations.quality) || 
          (typeof operations.quality === 'number' && operations.quality >= 0 && operations.quality <= 51)) {
        validOperations.quality = operations.quality;
      }
    }
    
    if (operations.trim && typeof operations.trim === 'object') {
      if (typeof operations.trim.start === 'number' && operations.trim.start >= 0 &&
          typeof operations.trim.duration === 'number' && operations.trim.duration > 0) {
        validOperations.trim = operations.trim;
      }
    }
    
    if (operations.crop && typeof operations.crop === 'object') {
      const { x, y, width, height } = operations.crop;
      if (typeof x === 'number' && typeof y === 'number' && 
          typeof width === 'number' && typeof height === 'number' &&
          width > 0 && height > 0) {
        validOperations.crop = operations.crop;
      }
    }
    
    if (operations.scale && typeof operations.scale === 'object') {
      const { width, height } = operations.scale;
      if (typeof width === 'number' && typeof height === 'number' &&
          width > 0 && height > 0) {
        validOperations.scale = operations.scale;
      }
    }
    
    if (operations.speed && typeof operations.speed === 'number' &&
        operations.speed >= 0.25 && operations.speed <= 4) {
      validOperations.speed = operations.speed;
    }
    
    if (operations.effects && Array.isArray(operations.effects)) {
      const validEffects = ['reverse', 'blur', 'sharpen', 'brightness', 'contrast'];
      validOperations.effects = operations.effects.filter(effect => 
        validEffects.includes(effect)
      );
    }

    const job = await videoService.createProcessingJob(file_id, validOperations);

    res.json({ job_id: job.id });
  } catch (error) {
    console.error('Process error:', error);
    res.status(500).json({
      error: 'Processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get processing status
router.get('/status/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = videoService.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      status: job.status,
      progress: job.progress,
      output_url: job.outputUrl,
      error: job.error
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({
      error: 'Failed to get status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Download processed file
router.get('/download/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const outputPath = await videoService.getOutputFilePath(jobId);

    if (!outputPath) {
      return res.status(404).json({ error: 'File not found or processing incomplete' });
    }

    res.download(outputPath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Download failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
