# Videtopia - Video Meme Processor

A fast, modern web-based video processing tool focused on meme creation and social media content. Built with React/Next.js frontend and Node.js backend using FFmpeg for video processing.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed on your system
- Git (to clone the repository)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/videtopia.git
   cd videtopia
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up --build -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

That's it! The application will be running with all dependencies automatically installed.

## 🎯 Features

### Video Processing
- **Upload**: Support for MP4, MOV, AVI, WebM, MKV, FLV formats
- **Compression**: High, medium, low quality presets with custom CRF values
- **Cropping**: Visual crop tool with aspect ratio presets (1:1, 16:9, 9:16, 4:5)
- **Scaling**: Resolution presets (4K, 1080p, 720p, 480p) with custom dimensions
- **Trimming**: Precise start/end time controls with visual timeline
- **Speed**: 0.25x to 4x speed adjustment with audio pitch correction
- **Effects**: Reverse, blur, sharpen, brightness, contrast filters
- **Formats**: Output to MP4, WebM, or optimized GIF

### User Experience
- **Drag & Drop**: Intuitive file upload interface
- **Real-time Progress**: Live processing updates via WebSocket
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Auto-cleanup**: Files automatically deleted after 30 minutes

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **File Upload**: react-dropzone
- **Video Player**: Custom HTML5 video player
- **Notifications**: react-hot-toast

### Backend
- **Runtime**: Node.js with Express
- **Video Processing**: FFmpeg
- **File Handling**: Multer
- **Real-time Updates**: Socket.IO
- **TypeScript**: Full type safety

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **File Storage**: Local filesystem with auto-cleanup
- **CORS**: Configurable origins for production

## 📁 Project Structure

```
videtopia/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
││   │   ├── lib/            # Utility functions
│   │   └── store/           # Zustand state management
│   ├── Dockerfile           # Frontend Docker configuration
│   └── package.json
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript definitions
│   │   └── utils/           # FFmpeg utilities
│   ├── Dockerfile           # Backend Docker configuration
│   └── package.json
├── docker-compose.yml        # Multi-container setup
├── README.md                # This file
└── .gitignore
```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables:

#### Backend
- `NODE_ENV`: Environment (production/development)
- `PORT`: Server port (default: 3001)
- `ALLOWED_ORIGINS`: CORS allowed origins (comma-separated)
- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 100MB)
- `UPLOAD_DIR`: Upload directory path
- `OUTPUT_DIR`: Output directory path
- `CLEANUP_INTERVAL`: Cleanup interval in milliseconds (default: 5 minutes)

#### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL

### Docker Compose Configuration

The `docker-compose.yml` file includes:
- **Backend service**: Node.js API with FFmpeg
- **Frontend service**: Next.js application
- **Volume mounts**: Persistent file storage
- **Health checks**: Automatic service monitoring
- **Environment variables**: Pre-configured for easy deployment

## 🚀 Deployment

### Local Development
```bash
# Start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

1. **Clone and configure**
   ```bash
   git clone https://github.com/yourusername/videtopia.git
   cd videtopia
   ```

2. **Update environment variables**
   Edit `docker-compose.yml` to set your domain:
   ```yaml
   environment:
     - ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

3. **Deploy**
   ```bash
   docker-compose up --build -d
   ```

4. **Set up reverse proxy** (recommended)
   Use Nginx or Traefik to handle SSL and domain routing.

## 📊 API Endpoints

### Upload
- `POST /api/upload` - Upload video file
- `GET /api/status/:jobId` - Get processing status
- `GET /api/download/:jobId` - Download processed file

### Health
- `GET /health` - Health check endpoint

## 🔒 Security Features

- **File Validation**: Strict MIME type and extension checking
- **Size Limits**: Configurable file size restrictions
- **CORS Protection**: Configurable origin restrictions
- **Auto-cleanup**: Automatic file deletion prevents storage abuse
- **Input Sanitization**: All processing parameters validated

## 🐛 Troubleshooting

### Common Issues

1. **Docker not found**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

2. **Port conflicts**
   ```bash
   # Check what's using the ports
   sudo netstat -tulpn | grep :3000
   sudo netstat -tulpn | grep :3001
   ```

3. **File upload fails**
   - Check file size (max 100MB)
   - Verify file format is supported
   - Ensure sufficient disk space

4. **Processing fails**
   - Check Docker logs: `docker-compose logs backend`
   - Verify FFmpeg is working: `docker exec video-meme-processor_backend_1 ffmpeg -version`

### Logs and Debugging

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check container status
docker-compose ps

# Restart services
docker-compose restart
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- FFmpeg for powerful video processing capabilities
- Next.js team for the excellent React framework
- Tailwind CSS for the utility-first CSS framework
- All open-source contributors who made this possible

---

**Authored by Mzumara Yamikani @ 2025**
