import { VideoStatus, VideoVisibility } from '../../../entities/video.entity';
import { CategoryResponseDto } from '../../categories/dto';
import { TagResponseDto } from '../../tags/dto';

export class VideoResponseDto {
  id!: string;
  title!: string;
  description?: string;
  status!: VideoStatus;
  visibility!: VideoVisibility;
  thumbnailUrl?: string;
  duration?: number;
  views!: number;
  createdAt!: Date;
  updatedAt!: Date;
  userId!: string;
  username!: string;
  userAvatarUrl?: string;
  categoryId?: string;
  category?: CategoryResponseDto;
  tags?: TagResponseDto[];
}

export class PaginatedVideosResponseDto {
  items!: VideoResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
