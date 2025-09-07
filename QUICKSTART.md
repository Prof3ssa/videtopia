# Quick Start Guide

## 🚀 Get Videtopia Running in 3 Steps

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/videtopia.git
cd videtopia
```

### 2. Run with Docker
```bash
# Option A: Use the deployment script (recommended)
./deploy.sh deploy

# Option B: Use Docker Compose directly
sudo docker-compose up --build -d
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🧪 Test the Installation
```bash
./test.sh
```

## 🛠️ Available Commands
```bash
./deploy.sh deploy    # Deploy the application
./deploy.sh stop      # Stop the application
./deploy.sh restart   # Restart the application
./deploy.sh logs      # View logs
./deploy.sh status    # Check status
./deploy.sh help      # Show help
```

## 📋 Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)
- At least 2GB of free disk space

## 🔧 Configuration
Edit `docker-compose.yml` to customize:
- Port numbers
- File size limits
- CORS origins
- Cleanup intervals

## 🆘 Need Help?
- Check the full [README.md](README.md) for detailed documentation
- View logs: `./deploy.sh logs`
- Run tests: `./test.sh`
- Check status: `./deploy.sh status`

---

**That's it! Videtopia is ready to process your videos! 🎬**
