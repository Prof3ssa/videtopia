import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import videoRoutes from './routes/video';
import { videoService } from './services/videoService';

// Load environment variables
dotenv.config();

const parseAllowedOrigins = (): string[] => {
  const fromEnv = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000';
  return fromEnv.split(',').map(o => o.trim()).filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));
app.use('/outputs', express.static('outputs'));

// Routes
app.use('/api', videoRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join job room for real-time updates
  socket.on('join-job', (jobId: string) => {
    socket.join(`job-${jobId}`);
    console.log(`Client ${socket.id} joined job room: ${jobId}`);
  });

  // Leave job room
  socket.on('leave-job', (jobId: string) => {
    socket.leave(`job-${jobId}`);
    console.log(`Client ${socket.id} left job room: ${jobId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Function to emit job progress updates
export const emitJobProgress = (jobId: string, progress: number, status: string) => {
  io.to(`job-${jobId}`).emit('job-progress', {
    jobId,
    progress,
    status,
    timestamp: new Date().toISOString()
  });
};

// Function to emit job completion
export const emitJobComplete = (jobId: string, outputUrl: string) => {
  io.to(`job-${jobId}`).emit('job-complete', {
    jobId,
    outputUrl,
    timestamp: new Date().toISOString()
  });
};

// Function to emit job error
export const emitJobError = (jobId: string, error: string) => {
  io.to(`job-${jobId}`).emit('job-error', {
    jobId,
    error,
    timestamp: new Date().toISOString()
  });
};

// Cleanup old files periodically
setInterval(async () => {
  try {
    await videoService.cleanupOldFiles();
    console.log('Cleanup completed');
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}, parseInt(process.env.CLEANUP_INTERVAL || '3600000')); // Default: 1 hour

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Videtopia Backend running on port ${PORT}`);
  console.log(`📁 Upload directory: ${process.env.UPLOAD_DIR || 'uploads'}`);
  console.log(`📁 Output directory: ${process.env.OUTPUT_DIR || 'outputs'}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
