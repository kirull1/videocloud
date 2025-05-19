import type { Category } from '@/entities/category';
import type { Tag } from '@/entities/tag';

export enum VideoStatus {
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

export enum VideoVisibility {
  PUBLIC = 'public',
  UNLISTED = 'unlisted',
  PRIVATE = 'private',
}

export interface Video {
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
  category?: Category;
  tags?: Tag[];
}

export interface VideoUploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}