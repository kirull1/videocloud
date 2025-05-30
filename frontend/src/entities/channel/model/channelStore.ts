import { makeAutoObservable, runInAction } from 'mobx';
import { channelApi } from '../api/channelApi';
import type {
  Channel,
  CreateChannelRequest,
  UpdateChannelRequest,
  ChannelAnalytics,
} from './types';

class ChannelStore {
  channels: Channel[] = [];
  currentChannel: Channel | null = null;
  myChannel: Channel | null = null;
  channelAnalytics: ChannelAnalytics | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async createChannel(channelData: CreateChannelRequest): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const channel = await channelApi.createChannel(channelData);
      
      runInAction(() => {
        this.channels.push(channel);
        this.myChannel = channel;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to create channel';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async fetchChannels(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const channels = await channelApi.getChannels();
      
      runInAction(() => {
        this.channels = channels;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to fetch channels';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async fetchChannel(id: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });
    
    console.log(`ChannelStore: Fetching channel with ID: ${id}`);

    try {
      const channel = await channelApi.getChannel(id);
      
      console.log(`ChannelStore: Channel data received:`, channel);
      
      runInAction(() => {
        this.currentChannel = channel;
        this.error = null;
        this.isLoading = false;
      });
    } catch (error) {
      console.error(`ChannelStore: Error fetching channel:`, error);
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to fetch channel';
        this.isLoading = false;
      });
    }
  }

  async fetchChannelByCustomUrl(customUrl: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const channel = await channelApi.getChannelByCustomUrl(customUrl);
      
      runInAction(() => {
        this.currentChannel = channel;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to fetch channel';
        this.isLoading = false;
      });
    }
  }

  async fetchMyChannel(): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const channel = await channelApi.getMyChannel();
      
      runInAction(() => {
        this.myChannel = channel;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to fetch your channel';
        this.myChannel = null;
        this.isLoading = false;
      });
    }
  }

  async updateChannel(id: string, channelData: UpdateChannelRequest): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const updatedChannel = await channelApi.updateChannel(id, channelData);
      
      runInAction(() => {
        // Update in channels array
        const index = this.channels.findIndex(channel => channel.id === id);
        if (index !== -1) {
          this.channels[index] = updatedChannel;
        }
        
        // Update current channel if it's the same
        if (this.currentChannel?.id === id) {
          this.currentChannel = updatedChannel;
        }
        
        // Update my channel if it's the same
        if (this.myChannel?.id === id) {
          this.myChannel = updatedChannel;
        }
        
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to update channel';
        this.isLoading = false;
      });
    }
  }

  async uploadBanner(id: string, file: File): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const updatedChannel = await channelApi.uploadBanner(id, file);
      
      runInAction(() => {
        // Update in channels array
        const index = this.channels.findIndex(channel => channel.id === id);
        if (index !== -1) {
          this.channels[index] = updatedChannel;
        }
        
        // Update current channel if it's the same
        if (this.currentChannel?.id === id) {
          this.currentChannel = updatedChannel;
        }
        
        // Update my channel if it's the same
        if (this.myChannel?.id === id) {
          this.myChannel = updatedChannel;
        }
        
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to upload banner';
        this.isLoading = false;
      });
    }
  }

  async fetchChannelAnalytics(id: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const analytics = await channelApi.getChannelAnalytics(id);
      
      runInAction(() => {
        this.channelAnalytics = analytics;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to fetch channel analytics';
        this.isLoading = false;
      });
    }
  }

  async deleteChannel(id: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      await channelApi.deleteChannel(id);
      
      runInAction(() => {
        // Remove from channels array
        this.channels = this.channels.filter(channel => channel.id !== id);
        
        // Clear current channel if it's the same
        if (this.currentChannel?.id === id) {
          this.currentChannel = null;
        }
        
        // Clear my channel if it's the same
        if (this.myChannel?.id === id) {
          this.myChannel = null;
        }
        
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to delete channel';
        this.isLoading = false;
      });
    }
  }

  clearError(): void {
    this.error = null;
  }
}

export const channelStore = new ChannelStore();