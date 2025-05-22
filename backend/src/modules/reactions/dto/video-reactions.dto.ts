import { Expose } from 'class-transformer';

export class VideoReactionsDto {
  @Expose()
  videoId: string;

  @Expose()
  likesCount: number;

  @Expose()
  dislikesCount: number;

  @Expose()
  userReaction?: string;
}