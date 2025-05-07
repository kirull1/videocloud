<script setup lang="ts">
import { computed } from 'vue';
import { VideoCard } from '@/entities/video';

export interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  uploadDate: Date;
  channelName: string;
  channelAvatarUrl: string;
  isNew?: boolean;
  isWatched?: boolean;
}

const props = defineProps({
  videos: {
    type: Array as () => VideoItem[],
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  columns: {
    type: Object as () => {
      xs?: number;
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
    },
    default: () => ({
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5
    })
  },
  gap: {
    type: String,
    default: '16px'
  },
  emptyMessage: {
    type: String,
    default: 'No videos found'
  }
});

const emit = defineEmits(['videoClick', 'channelClick']);

const gridStyle = computed(() => {
  return {
    gap: props.gap,
    gridTemplateColumns: `repeat(var(--grid-columns, ${props.columns.md || 3}), 1fr)`
  };
});

const handleVideoClick = (videoId: string) => {
  emit('videoClick', videoId);
};

const handleChannelClick = (channelName: string) => {
  emit('channelClick', channelName);
};
</script>

<template>
  <div class="video-grid">
    <div v-if="loading" class="video-grid__loading">
      <div v-for="i in 8" :key="i" class="video-grid__skeleton"/>
    </div>
    
    <div v-else-if="videos.length === 0" class="video-grid__empty">
      {{ emptyMessage }}
    </div>
    
    <div v-else class="video-grid__container" :style="gridStyle">
      <div v-for="video in videos" :key="video.id" class="video-grid__item">
        <VideoCard
          :id="video.id"
          :title="video.title"
          :thumbnailUrl="video.thumbnailUrl"
          :duration="video.duration"
          :views="video.views"
          :uploadDate="video.uploadDate"
          :channelName="video.channelName"
          :channelAvatarUrl="video.channelAvatarUrl"
          :isNew="video.isNew"
          :isWatched="video.isWatched"
          @click="handleVideoClick"
          @channelClick="handleChannelClick"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-grid {
  width: 100%;
}

.video-grid__container {
  display: grid;
  width: 100%;
}

.video-grid__item {
  width: 100%;
}

.video-grid__empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px 16px;
  color: var(--text-secondary, #67748B);
  font-size: 16px;
  text-align: center;
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  min-height: 200px;
}

.video-grid__loading {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns, 3), 1fr);
  gap: 16px;
  width: 100%;
}

.video-grid__skeleton {
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.video-grid__skeleton::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@media (max-width: 576px) {
  .video-grid__container,
  .video-grid__loading {
    --grid-columns: v-bind('columns.xs || 1');
  }
}

@media (min-width: 577px) and (max-width: 768px) {
  .video-grid__container,
  .video-grid__loading {
    --grid-columns: v-bind('columns.sm || 2');
  }
}

@media (min-width: 769px) and (max-width: 992px) {
  .video-grid__container,
  .video-grid__loading {
    --grid-columns: v-bind('columns.md || 3');
  }
}

@media (min-width: 993px) and (max-width: 1200px) {
  .video-grid__container,
  .video-grid__loading {
    --grid-columns: v-bind('columns.lg || 4');
  }
}

@media (min-width: 1201px) {
  .video-grid__container,
  .video-grid__loading {
    --grid-columns: v-bind('columns.xl || 5');
  }
}
</style>