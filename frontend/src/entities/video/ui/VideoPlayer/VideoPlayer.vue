<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { videoApi } from '../../api/videoApi';
import type { StreamingInfo, StreamingQuality } from '../../api/videoApi';

const props = defineProps({
  videoId: {
    type: String,
    default: ''
  },
  src: {
    type: String,
    default: ''
  },
  poster: {
    type: String,
    default: ''
  },
  autoplay: {
    type: Boolean,
    default: false
  },
  controls: {
    type: Boolean,
    default: true
  },
  loop: {
    type: Boolean,
    default: false
  },
  muted: {
    type: Boolean,
    default: false
  },
  preferredQuality: {
    type: String,
    default: 'auto',
    validator: (value: string) => ['auto', 'high', 'medium', 'low'].includes(value)
  },
  preferredFormat: {
    type: String,
    default: 'mp4',
    validator: (value: string) => ['mp4', 'hls', 'dash'].includes(value)
  }
});

const videoElement = ref<HTMLVideoElement | null>(null);
const currentSrc = ref(props.src);
const currentPoster = ref(props.poster);
const isLoading = ref(false);
const error = ref<string | null>(null);
const streamingInfo = ref<StreamingInfo | null>(null);
const availableQualities = ref<StreamingQuality[]>([]);
const selectedQuality = ref(props.preferredQuality);

// Load streaming info if videoId is provided
watch(() => props.videoId, async (newVideoId) => {
  if (newVideoId) {
    await loadStreamingInfo(newVideoId);
  }
}, { immediate: true });

// Watch for quality changes
watch(() => selectedQuality.value, () => {
  if (streamingInfo.value && availableQualities.value.length > 0) {
    updateVideoSource();
  }
});

async function loadStreamingInfo(videoId: string) {
  if (!videoId) return;
  
  isLoading.value = true;
  error.value = null;
  
  try {
    streamingInfo.value = await videoApi.getStreamingInfo(videoId, {
      format: props.preferredFormat as 'mp4' | 'hls' | 'dash',
      quality: selectedQuality.value as 'auto' | 'high' | 'medium' | 'low'
    });
    
    availableQualities.value = streamingInfo.value.qualities;
    
    // Update video source with streaming info
    updateVideoSource();
  } catch (err: any) {
    console.error('Error loading streaming info:', err);
    error.value = err.message || 'Failed to load video';
  } finally {
    isLoading.value = false;
  }
}

function updateVideoSource() {
  if (!streamingInfo.value) return;
  
  // If we have streaming info, use the URL from it
  currentSrc.value = streamingInfo.value.url;
  
  // If we have a video element, update its source
  if (videoElement.value) {
    const currentTime = videoElement.value.currentTime;
    const wasPlaying = !videoElement.value.paused;
    
    videoElement.value.src = currentSrc.value;
    videoElement.value.load();
    
    // Restore playback position and state
    videoElement.value.currentTime = currentTime;
    if (wasPlaying) {
      videoElement.value.play().catch(err => console.error('Error playing video:', err));
    }
  }
}

function changeQuality(quality: string) {
  selectedQuality.value = quality as 'auto' | 'high' | 'medium' | 'low';
}

onMounted(() => {
  // If we have a videoId, load streaming info
  if (props.videoId) {
    loadStreamingInfo(props.videoId);
  } else {
    // Otherwise, use the provided src
    currentSrc.value = props.src;
  }
});
</script>

<template>
  <div class="video-player">
    <div v-if="isLoading" class="video-player__loading">
      Loading video...
    </div>
    
    <div v-else-if="error" class="video-player__error">
      {{ error }}
    </div>
    
    <template v-else>
      <video
        ref="videoElement"
        class="video-player__video"
        :src="currentSrc"
        :poster="currentPoster || poster"
        :autoplay="autoplay"
        :controls="controls"
        :loop="loop"
        :muted="muted"
        preload="metadata"
      />
      
      <div v-if="availableQualities.length > 0" class="video-player__quality-selector">
        <button
          v-for="quality in availableQualities"
          :key="quality.label"
          :class="['video-player__quality-button', { 'video-player__quality-button--active': selectedQuality === quality.label.toLowerCase() }]"
          @click="changeQuality(quality.label.toLowerCase())"
        >
          {{ quality.label }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.video-player {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: #000;
}

.video-player__video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-player__loading,
.video-player__error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  font-size: 1.2rem;
}

.video-player__error {
  color: #ff5252;
}

.video-player__quality-selector {
  position: absolute;
  bottom: 60px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  padding: 8px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-player:hover .video-player__quality-selector {
  opacity: 1;
}

.video-player__quality-button {
  background-color: transparent;
  border: none;
  color: white;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 3px;
  font-size: 0.9rem;
  text-align: left;
  transition: background-color 0.2s ease;
}

.video-player__quality-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.video-player__quality-button--active {
  background-color: var(--primary, #41A4FF);
  color: white;
}
</style>