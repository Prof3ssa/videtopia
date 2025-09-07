import { useVideoStore } from '@/store/videoStore';
import { ProcessingSettings } from '@/store/videoStore';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const useVideoProcessing = () => {
  const {
    currentFile,
    setProcessingJob,
    updateJobProgress,
    updateJobStatus,
    setUploading,
    setUploadProgress,
  } = useVideoStore();

  const uploadVideo = async (file: File): Promise<boolean> => {
    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      
      // Update store with file info
      useVideoStore.getState().setCurrentFile({
        id: data.file_id,
        name: file.name,
        size: file.size,
        duration: data.duration,
        width: data.dimensions.width,
        height: data.dimensions.height,
        format: data.format,
        url: URL.createObjectURL(file),
      });

      setUploadProgress(100);
      toast.success('Video uploaded successfully!');
      return true;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
      return false;
    } finally {
      setUploading(false);
    }
  };

  const processVideo = async (settings: ProcessingSettings): Promise<boolean> => {
    if (!currentFile) {
      toast.error('No video file selected');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: currentFile.id,
          operations: settings,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Processing failed');
      }

      const data = await response.json();
      
      // Create processing job
      const job = {
        id: data.job_id,
        status: 'pending' as const,
        progress: 0,
      };
      
      setProcessingJob(job);
      toast.success('Processing started!');
      
      // Start polling for status
      pollJobStatus(data.job_id);
      return true;
    } catch (error) {
      console.error('Processing error:', error);
      toast.error(error instanceof Error ? error.message : 'Processing failed');
      return false;
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/status/${jobId}`);
        
        if (!response.ok) {
          throw new Error('Failed to get job status');
        }

        const data = await response.json();
        
        updateJobProgress(data.progress);
        
        if (data.status === 'completed') {
          updateJobStatus('completed', data.output_url);
          clearInterval(pollInterval);
          toast.success('Video processing completed!');
        } else if (data.status === 'failed') {
          updateJobStatus('failed', undefined, data.error);
          clearInterval(pollInterval);
          toast.error(`Processing failed: ${data.error}`);
        }
      } catch (error) {
        console.error('Status polling error:', error);
        clearInterval(pollInterval);
        updateJobStatus('failed', undefined, 'Failed to get processing status');
      }
    }, 1000); // Poll every second

    // Cleanup after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 600000);
  };

  const downloadProcessedVideo = async (jobId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/download/${jobId}`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed-video-${jobId}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
    }
  };

  return {
    uploadVideo,
    processVideo,
    downloadProcessedVideo,
  };
};
