export interface Channel {
  id: string;
  name: string;
  description?: string;
  bannerUrl?: string;
  customUrl?: string;
  themeColor?: string;
  featuredVideoId?: string;
  totalViews: number;
  subscriberCount: number;
  videoCount: number;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChannelRequest {
  name: string;
  description?: string;
  customUrl?: string;
  themeColor?: string;
  featuredVideoId?: string;
}

export interface UpdateChannelRequest {
  name?: string;
  description?: string;
  customUrl?: string;
  themeColor?: string;
  featuredVideoId?: string;
}

export interface ChannelAnalytics {
  totalViews: number;
  subscriberCount: number;
  videoCount: number;
  averageViewsPerVideo: number;
  mostViewedVideos: MostViewedVideo[];
  viewsPerDay: ViewsPerDay[];
  subscribersPerDay: SubscribersPerDay[];
}

export interface MostViewedVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  views: number;
}

export interface ViewsPerDay {
  date: string;
  views: number;
}

export interface SubscribersPerDay {
  date: string;
  subscribers: number;
}