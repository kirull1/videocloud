import { VideoStatus, VideoVisibility } from '../model/types';
import type { Tag } from '@/entities/tag';

interface CreateVideoRequest {
  title: string;
  description?: string;
  visibility?: VideoVisibility;
  file: File;
  categoryId?: string;
  tagIds?: string[];
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

const API_URL = '/api/videos';

export const videoApi = {
  async uploadVideo(data: CreateVideoRequest): Promise<VideoResponse> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
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
    
    formData.append('file', data.file);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload video');
    }

    return response.json();
  },

  async getVideos(params: VideoQueryParams = {}): Promise<PaginatedVideosResponse> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Build query string
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `${API_URL}?${queryString}` : API_URL;
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch videos');
    }

    return response.json();
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
};