import { Exclude, Expose, Type } from 'class-transformer';

export class ChannelResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  bannerUrl: string;

  @Expose()
  customUrl: string;

  @Expose()
  themeColor: string;

  @Expose()
  featuredVideoId: string;

  @Expose()
  totalViews: number;

  @Expose()
  subscriberCount: number;

  @Expose()
  videoCount: number;

  @Expose()
  userId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}