import { Exclude, Expose, Transform } from 'class-transformer';
import { Comment } from '../../../entities/comment.entity';

export class CommentResponseDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  parentId: string | null;

  @Expose()
  videoId: string;

  @Expose()
  userId: string;

  @Expose()
  @Transform(({ obj }) => obj.user?.username || null)
  username: string | null;

  @Expose()
  @Transform(({ obj }) => obj.user?.avatarUrl || null)
  userAvatarUrl: string | null;

  @Expose()
  likesCount: number;

  @Expose()
  dislikesCount: number;

  @Expose()
  repliesCount: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  user: any;

  constructor(partial: Partial<Comment>) {
    Object.assign(this, partial);
  }
}