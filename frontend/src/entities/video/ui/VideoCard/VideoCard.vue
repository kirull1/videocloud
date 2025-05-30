<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Category } from '@/entities/category/model/types';
import type { Tag } from '@/entities/tag/model/types';

// Get router instance
const router = useRouter();

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  uploadDate: {
    type: Date,
    default: () => new Date()
  },
  channelId: {
    type: String,
    default: ''
  },
  channelName: {
    type: String,
    default: ''
  },
  channelAvatarUrl: {
    type: String,
    default: ''
  },
  isNew: {
    type: Boolean,
    default: false
  },
  isWatched: {
    type: Boolean,
    default: false
  },
  category: {
    type: Object as () => Category | null,
    default: null
  },
  tags: {
    type: Array as () => Tag[],
    default: () => []
  },
  userId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click', 'channelClick']);

const formattedDuration = computed(() => {
  if (props.duration === null || props.duration === undefined) {
    return '0:00';
  }
  const minutes = Math.floor(props.duration / 60);
  const seconds = props.duration % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
});

const formattedViews = computed(() => {
  if (props.views >= 1000000) {
    return `${(props.views / 1000000).toFixed(1)}M views`;
  } else if (props.views >= 1000) {
    return `${(props.views / 1000).toFixed(1)}K views`;
  }
  return `${props.views} views`;
});

const formattedDate = computed(() => {
  const now = new Date();
  const uploadDate = new Date(props.uploadDate);
  const diffTime = Math.abs(now.getTime() - uploadDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
});

const handleClick = () => {
  // Emit the click event for backward compatibility
  emit('click', props.id);
  
  // Navigate to the video player page using Vue Router
  router.push({
    name: 'video-watch',
    query: { id: props.id }
  });
};

const handleChannelClick = (event: Event) => {
  event.stopPropagation();
  
  // Emit the channelClick event for backward compatibility
  emit('channelClick', props.channelName);
  
  // Define channel interface for type safety
  interface Channel {
    id: string;
    userId: string;
    name: string;
  }
  
  // Navigate to the channel page if channelId is available
  if (props.channelId) {
    router.push({
      name: 'channel-detail',
      params: { id: props.channelId }
    });
  } else if (props.userId) {
    // If we have userId but no channelId, we need to first get the channel for this user
    console.log('Looking for channel for user:', props.userId);
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    
    // Get channels and filter by userId on the client side
    fetch(`${baseUrl}/channels`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }
        return response.json() as Promise<Channel[]>;
      })
      .then(channels => {
        // Find the channel that belongs to this user
        const userChannel = channels.find((channel: Channel) => channel.userId === props.userId);
        
        if (userChannel) {
          console.log('Found channel:', userChannel);
          router.push({
            name: 'channel-detail',
            params: { id: userChannel.id }
          });
        } else {
          console.error('No channel found for user:', props.userId);
        }
      })
      .catch(error => {
        console.error('Error fetching channel for user:', error);
      });
  }
};
</script>

<template>
  <div 
    class="video-card" 
    :class="{ 'video-card--watched': isWatched }"
    @click="handleClick"
  >
    <div class="video-card__thumbnail-container">
      <img 
        :src="thumbnailUrl" 
        :alt="title" 
        class="video-card__thumbnail"
      />
      <div class="video-card__duration">{{ formattedDuration }}</div>
      <div v-if="isNew" class="video-card__badge">NEW</div>
      <div v-if="isWatched" class="video-card__progress-bar"/>
    </div>
    
    <div class="video-card__content">
      <div v-if="channelAvatarUrl" class="video-card__channel-avatar-container">
        <img 
          :src="channelAvatarUrl" 
          :alt="channelName" 
          class="video-card__channel-avatar"
          @click="handleChannelClick"
        />
      </div>
      
      <div class="video-card__info">
        <h3 class="video-card__title">{{ title }}</h3>
        
        <div v-if="channelName" class="video-card__channel-name" @click="handleChannelClick">
          {{ channelName }}
        </div>
        
        <div class="video-card__meta">
          <span class="video-card__views">{{ formattedViews }}</span>
          <span class="video-card__separator">•</span>
          <span class="video-card__date">{{ formattedDate }}</span>
        </div>
        
        <!-- Categories and tags removed as requested -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-card {
  width: 100%;
  cursor: pointer;
  transition: transform 0.2s ease;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--panel-bg, #E6F0FB);
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-card--watched .video-card__thumbnail {
  opacity: 0.7;
}

.video-card__thumbnail-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;
}

.video-card__thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.video-card:hover .video-card__thumbnail {
  transform: scale(1.05);
}

.video-card__duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.video-card__badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: var(--primary, #41A4FF);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
}

.video-card__progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 70%;
  background-color: var(--primary, #41A4FF);
}

.video-card__content {
  display: flex;
  padding: 12px;
  gap: 12px;
}

.video-card__channel-avatar-container {
  flex-shrink: 0;
}

.video-card__channel-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.video-card__channel-avatar:hover {
  transform: scale(1.1);
}

.video-card__info {
  flex-grow: 1;
  min-width: 0;
}

.video-card__title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  color: var(--text-primary, #1A2233);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-card__channel-name {
  font-size: 14px;
  color: var(--text-secondary, #67748B);
  margin-bottom: 4px;
  cursor: pointer;
}

.video-card__channel-name:hover {
  color: var(--primary, #41A4FF);
}

.video-card__meta {
  font-size: 12px;
  color: var(--text-secondary, #67748B);
  display: flex;
  align-items: center;
}

.video-card__separator {
  margin: 0 4px;
}

/* Category and tag styles removed */

@media (max-width: 768px) {
  .video-card__title {
    font-size: 14px;
  }
  
  .video-card__channel-name {
    font-size: 12px;
  }
  
  .video-card__meta {
    font-size: 11px;
  }
  
  .video-card__channel-avatar {
    width: 32px;
    height: 32px;
  }
}
</style>