import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '104857600'); // 100MB default
const ALLOWED_FORMATS = [
  'video/mp4',
  'video/mov',
  'video/avi',
  'video/webm',
  'video/mkv',
  'video/flv'
];

const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv'];

// Configure multer storage to use the uploads directory directly
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use the uploads directory from environment or default to ./uploads
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file extension
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return cb(new Error(`Unsupported file extension: ${fileExtension}`));
  }

  // Check MIME type
  if (!ALLOWED_FORMATS.includes(file.mimetype)) {
    return cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }

  cb(null, true);
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // Only allow one file at a time
  }
});

// Error handling middleware
export const handleUploadError = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Only one file can be uploaded at a time'
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: error.message
    });
  }

  if (error.message.includes('Unsupported')) {
    return res.status(400).json({
      error: 'Unsupported file',
      message: error.message
    });
  }

  next(error);
};

// Validation middleware
export const validateVideoFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'No file uploaded',
      message: 'Please upload a video file'
    });
  }

  // Additional validation can be added here
  // For example, checking if the file is actually a valid video

  next();
};
