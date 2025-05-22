import { Expose } from 'class-transformer';

export class ChannelAnalyticsDto {
  @Expose()
  totalViews: number;

  @Expose()
  subscriberCount: number;

  @Expose()
  videoCount: number;

  @Expose()
  averageViewsPerVideo: number;

  @Expose()
  mostViewedVideos: MostViewedVideoDto[];

  @Expose()
  viewsPerDay: ViewsPerDayDto[];

  @Expose()
  subscribersPerDay: SubscribersPerDayDto[];
}

export class MostViewedVideoDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  thumbnailUrl: string;

  @Expose()
  views: number;
}

export class ViewsPerDayDto {
  @Expose()
  date: string;

  @Expose()
  views: number;
}

export class SubscribersPerDayDto {
  @Expose()
  date: string;

  @Expose()
  subscribers: number;
}