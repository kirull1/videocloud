import { VideoStatus, VideoVisibility } from '../model/types';
import type { Tag } from '@/entities/tag';
import { appConfig } from '@/shared/config/app.config';

interface CreateVideoRequest {
  title: string;
  description?: string;
  visibility?: VideoVisibility;
  file: File;
  categoryId?: string;
  tagIds?: string[];
  thumbnail?: Blob;
  duration?: number;
}

interface UpdateVideoRequest {
  title?: string;
  description?: string;
  visibility?: VideoVisibility;
  categoryId?: string;
  tagIds?: string[];
}

interface VideoQueryParams {
  search?: string;
  status?: VideoStatus;
  visibility?: VideoVisibility;
  categoryId?: string;
  tagId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface VideoResponse {
  id: string;
  title: string;
  description?: string;
  status: VideoStatus;
  visibility: VideoVisibility;
  thumbnailUrl?: string;
  duration?: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  username: string;
  userAvatarUrl?: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags?: Tag[];
}

interface PaginatedVideosResponse {
  items: VideoResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UploadProgressCallback {
  (progress: number, loaded: number, total: number): void;
}

export interface StreamingQuality {
  label: string;
  url: string;
  width: number;
  height: number;
}

export interface StreamingInfo {
  url: string;
  format: string;
  mimeType: string;
  duration: number;
  qualities: StreamingQuality[];
}

export interface StreamingOptions {
  format?: 'mp4' | 'hls' | 'dash';
  quality?: 'auto' | 'high' | 'medium' | 'low';
  startTime?: number;
}

// Use the API URL from environment variable or config like in channel API
const API_URL = `${import.meta.env.VITE_API_URL || appConfig.apiUrl || '/api'}/videos`;

console.log('Video API initialized with API_URL:', API_URL);

export const videoApi = {
  async uploadVideo(
    data: CreateVideoRequest, 
    onProgress?: UploadProgressCallback
  ): Promise<VideoResponse> {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        reject(new Error('Not authenticated'));
        return;
      }
      
      const formData = new FormData();
      formData.append('title', data.title);
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      if (data.visibility) {
        formData.append('visibility', data.visibility);
      }
      
      if (data.categoryId) {
        formData.append('categoryId', data.categoryId);
      }
      
      if (data.tagIds && data.tagIds.length > 0) {
        data.tagIds.forEach((tagId, index) => {
          formData.append(`tagIds[${index}]`, tagId);
        });
      }
      
      // Add duration if available
      if (data.duration !== undefined) {
        formData.append('duration', data.duration.toString());
        console.log(`Adding video duration: ${data.duration} seconds`);
      }

      console.log(data);
      
      // Log file details before upload
      console.log(`Uploading file: ${data.file.name}, size: ${data.file.size} bytes`);
      
      formData.append('file', data.file);
      
      // Append thumbnail if available
      if (data.thumbnail) {
        console.log('Uploading thumbnail');
        formData.append('thumbnail', data.thumbnail, 'thumbnail.jpg');
      }
      
      // Use XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          console.log(`Upload progress: ${percentComplete}%, ${event.loaded}/${event.total} bytes`);
          
          if (onProgress) {
            onProgress(percentComplete, event.loaded, event.total);
          }
        } else {
          console.log('Upload progress: Length not computable');
        }
      });
      
      // Handle load start
      xhr.addEventListener('loadstart', () => {
        console.log('Upload started');
      });
      
      // Handle load end
      xhr.addEventListener('loadend', () => {
        console.log('Upload ended');
      });
      
      // Handle response
      xhr.addEventListener('load', () => {
        console.log(`Upload completed with status: ${xhr.status}`);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Upload response:', response);
            resolve(response);
          } catch (error) {
            console.error('Failed to parse response:', error);
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            console.error('Upload error response:', error);
            reject(new Error(error.message || 'Failed to upload video'));
          } catch (e) {
            console.error('HTTP error:', xhr.status, xhr.statusText);
            reject(new Error(`HTTP error ${xhr.status}`));
          }
        }
      });
      
      // Handle network errors
      xhr.addEventListener('error', (e) => {
        console.error('Network error occurred during upload:', e);
        reject(new Error('Network error occurred'));
      });
      
      // Handle timeout
      xhr.addEventListener('timeout', () => {
        console.error('Request timed out');
        reject(new Error('Request timed out'));
      });
      
      // Handle abort
      xhr.addEventListener('abort', () => {
        console.log('Upload aborted');
        reject(new Error('Upload aborted'));
      });
      
      // Open and send the request
      xhr.open('POST', API_URL, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  },

  async getVideos(params: any = {}): Promise<any> {
    console.log('VideoAPI: Fetching videos with params:', params);
    
    const queryParams = new URLSearchParams();
    
    // Add all parameters to the query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    
    // Create the URL with query parameters
    const url = `${API_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('VideoAPI: Fetching from URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('VideoAPI: Error fetching videos:', response.status, response.statusText);
      throw new Error(`Failed to fetch videos: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('VideoAPI: Received data:', data);
    return data;
  },

  async getVideo(id: string): Promise<VideoResponse> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch video');
    }

    return response.json();
  },

  async updateVideo(id: string, data: UpdateVideoRequest): Promise<VideoResponse> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update video');
    }

    return response.json();
  },

  async deleteVideo(id: string): Promise<void> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete video');
    }
  },

  async getStreamingInfo(id: string, options: StreamingOptions = {}): Promise<StreamingInfo> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Build query string
    const queryParams = new URLSearchParams();
    
    if (options.format) {
      queryParams.append('format', options.format);
    }
    
    if (options.quality) {
      queryParams.append('quality', options.quality);
    }
    
    if (options.startTime !== undefined) {
      queryParams.append('startTime', String(options.startTime));
    }
    
    const queryString = queryParams.toString();
    const url = queryString
      ? `${API_URL}/${id}/streaming-info?${queryString}`
      : `${API_URL}/${id}/streaming-info`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch streaming information');
    }

    return response.json();
  },
};