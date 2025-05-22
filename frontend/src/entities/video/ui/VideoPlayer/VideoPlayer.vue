<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
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
  },
  useCustomControls: {
    type: Boolean,
    default: true
  }
});

const videoElement = ref<HTMLVideoElement | null>(null);
const playerContainer = ref<HTMLDivElement | null>(null);
const currentSrc = ref(props.src);
const currentPoster = ref(props.poster);
const isLoading = ref(false);
const error = ref<string | null>(null);
const streamingInfo = ref<StreamingInfo | null>(null);
const availableQualities = ref<StreamingQuality[]>([]);
const selectedQuality = ref(props.preferredQuality);

// Custom controls state
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(1);
const isMuted = ref(props.muted);
const isFullscreen = ref(false);
const isPictureInPicture = ref(false);
const showControls = ref(true);
const controlsTimeout = ref<number | null>(null);
const playbackRate = ref(1);
const availablePlaybackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const showPlaybackRateSelector = ref(false);
const showVolumeSlider = ref(false);

// Computed properties
const formattedCurrentTime = computed(() => formatTime(currentTime.value));
const formattedDuration = computed(() => formatTime(duration.value));
const progress = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0));

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

// Format time in MM:SS format
function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

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
    const currentTimeValue = videoElement.value.currentTime;
    const wasPlaying = !videoElement.value.paused;
    
    videoElement.value.src = currentSrc.value;
    videoElement.value.load();
    
    // Restore playback position and state
    videoElement.value.currentTime = currentTimeValue;
    if (wasPlaying) {
      videoElement.value.play().catch(err => console.error('Error playing video:', err));
    }
  }
}

function changeQuality(quality: string) {
  selectedQuality.value = quality as 'auto' | 'high' | 'medium' | 'low';
}

// Video control functions
function togglePlay() {
  if (!videoElement.value) return;
  
  if (videoElement.value.paused) {
    videoElement.value.play()
      .then(() => {
        isPlaying.value = true;
      })
      .catch(err => {
        console.error('Error playing video:', err);
      });
  } else {
    videoElement.value.pause();
    isPlaying.value = false;
  }
}

function toggleMute() {
  if (!videoElement.value) return;
  
  isMuted.value = !isMuted.value;
  videoElement.value.muted = isMuted.value;
}

function setVolume(value: number) {
  if (!videoElement.value) return;
  
  volume.value = Math.max(0, Math.min(1, value));
  videoElement.value.volume = volume.value;
  
  // Unmute if volume is set above 0
  if (volume.value > 0 && isMuted.value) {
    isMuted.value = false;
    videoElement.value.muted = false;
  }
  
  // Mute if volume is set to 0
  if (volume.value === 0 && !isMuted.value) {
    isMuted.value = true;
    videoElement.value.muted = true;
  }
}

function seek(event: MouseEvent) {
  if (!videoElement.value || !duration.value) return;
  
  const progressBar = event.currentTarget as HTMLElement;
  const rect = progressBar.getBoundingClientRect();
  const pos = (event.clientX - rect.left) / rect.width;
  
  videoElement.value.currentTime = pos * duration.value;
  currentTime.value = videoElement.value.currentTime;
}

function toggleFullscreen() {
  if (!playerContainer.value) return;
  
  if (!document.fullscreenElement) {
    playerContainer.value.requestFullscreen()
      .then(() => {
        isFullscreen.value = true;
      })
      .catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
  } else {
    document.exitFullscreen()
      .then(() => {
        isFullscreen.value = false;
      })
      .catch(err => {
        console.error('Error attempting to exit fullscreen:', err);
      });
  }
}

async function togglePictureInPicture() {
  if (!videoElement.value) return;
  
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      isPictureInPicture.value = false;
    } else {
      await videoElement.value.requestPictureInPicture();
      isPictureInPicture.value = true;
    }
  } catch (err) {
    console.error('Error toggling picture-in-picture:', err);
  }
}

function setPlaybackRate(rate: number) {
  if (!videoElement.value) return;
  
  playbackRate.value = rate;
  videoElement.value.playbackRate = rate;
  showPlaybackRateSelector.value = false;
}

function showControlsTemporarily() {
  showControls.value = true;
  
  // Clear existing timeout
  if (controlsTimeout.value) {
    window.clearTimeout(controlsTimeout.value);
  }
  
  // Hide controls after 3 seconds of inactivity
  controlsTimeout.value = window.setTimeout(() => {
    if (isPlaying.value) {
      showControls.value = false;
    }
  }, 3000);
}

// Event handlers
function onTimeUpdate() {
  if (!videoElement.value) return;
  
  currentTime.value = videoElement.value.currentTime;
}

function onDurationChange() {
  if (!videoElement.value) return;
  
  duration.value = videoElement.value.duration;
}

function onPlay() {
  isPlaying.value = true;
}

function onPause() {
  isPlaying.value = false;
}

function onVolumeChange() {
  if (!videoElement.value) return;
  
  volume.value = videoElement.value.volume;
  isMuted.value = videoElement.value.muted;
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

function onPictureInPictureChange() {
  isPictureInPicture.value = document.pictureInPictureElement === videoElement.value;
}

function onKeydown(event: KeyboardEvent) {
  if (!videoElement.value) return;
  
  // Only handle keyboard shortcuts if the player is focused
  if (!playerContainer.value?.contains(document.activeElement)) return;
  
  switch (event.key.toLowerCase()) {
    case ' ':
    case 'k':
      event.preventDefault();
      togglePlay();
      break;
    case 'f':
      event.preventDefault();
      toggleFullscreen();
      break;
    case 'p':
      event.preventDefault();
      togglePictureInPicture();
      break;
    case 'm':
      event.preventDefault();
      toggleMute();
      break;
    case 'arrowleft':
      event.preventDefault();
      videoElement.value.currentTime = Math.max(0, videoElement.value.currentTime - 5);
      break;
    case 'arrowright':
      event.preventDefault();
      videoElement.value.currentTime = Math.min(videoElement.value.duration, videoElement.value.currentTime + 5);
      break;
    case 'arrowup':
      event.preventDefault();
      setVolume(volume.value + 0.1);
      break;
    case 'arrowdown':
      event.preventDefault();
      setVolume(volume.value - 0.1);
      break;
  }
}

onMounted(() => {
  // If we have a videoId, load streaming info
  if (props.videoId) {
    loadStreamingInfo(props.videoId);
  } else {
    // Otherwise, use the provided src
    currentSrc.value = props.src;
  }
  
  // Add event listeners
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('keydown', onKeydown);
  
  if (videoElement.value) {
    videoElement.value.addEventListener('enterpictureinpicture', onPictureInPictureChange);
    videoElement.value.addEventListener('leavepictureinpicture', onPictureInPictureChange);
  }
});

onUnmounted(() => {
  // Remove event listeners
  document.removeEventListener('fullscreenchange', onFullscreenChange);
  document.removeEventListener('keydown', onKeydown);
  
  if (videoElement.value) {
    videoElement.value.removeEventListener('enterpictureinpicture', onPictureInPictureChange);
    videoElement.value.removeEventListener('leavepictureinpicture', onPictureInPictureChange);
  }
  
  // Clear any timeouts
  if (controlsTimeout.value) {
    window.clearTimeout(controlsTimeout.value);
  }
});
</script>

<template>
  <div
    ref="playerContainer"
    class="video-player"
    @mousemove="showControlsTemporarily"
    @mouseleave="showControls = isPlaying ? false : true"
  >
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
        :controls="!useCustomControls && controls"
        :loop="loop"
        :muted="isMuted"
        preload="metadata"
        @timeupdate="onTimeUpdate"
        @durationchange="onDurationChange"
        @play="onPlay"
        @pause="onPause"
        @volumechange="onVolumeChange"
        @click="togglePlay"
      />
      
      <!-- Custom video controls -->
      <div
        v-if="useCustomControls"
        class="video-player__controls"
        :class="{ 'video-player__controls--visible': showControls || !isPlaying }"
      >
        <!-- Progress bar -->
        <div class="video-player__progress" @click="seek">
          <div class="video-player__progress-bar" :style="{ width: `${progress}%` }"/>
        </div>
        
        <div class="video-player__controls-row">
          <!-- Play/Pause button -->
          <button class="video-player__control-button" @click="togglePlay">
            <span v-if="isPlaying" class="video-player__icon">
              <svg width="16"
                   height="16"
                   viewBox="0 0 16 16"
                   fill="currentColor">
                <rect x="3"
                      y="2"
                      width="3"
                      height="12"
                      rx="1" />
                <rect x="10"
                      y="2"
                      width="3"
                      height="12"
                      rx="1" />
              </svg>
            </span>
            <span v-else class="video-player__icon">
              <svg width="16"
                   height="16"
                   viewBox="0 0 16 16"
                   fill="currentColor">
                <path d="M4 2.5a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5H4zm7 0a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5h-1z" />
              </svg>
            </span>
          </button>
          
          <!-- Volume control -->
          <div class="video-player__volume-container">
            <button
              class="video-player__control-button"
              @click="toggleMute"
              @mouseenter="showVolumeSlider = true"
            >
              <span v-if="isMuted || volume === 0" class="video-player__icon">
                <svg width="16"
                     height="16"
                     viewBox="0 0 16 16"
                     fill="currentColor">
                  <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z"/>
                </svg>
              </span>
              <span v-else-if="volume < 0.5" class="video-player__icon">
                <svg width="16"
                     height="16"
                     viewBox="0 0 16 16"
                     fill="currentColor">
                  <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm1.318 2.472a.5.5 0 0 1 0 .708L7.39 8l.645.646a.5.5 0 0 1-.708.708L6.682 8.707l-.646.647a.5.5 0 0 1-.708-.708L5.975 8l-.646-.646a.5.5 0 0 1 .708-.708l.646.647.646-.647a.5.5 0 0 1 .708 0z"/>
                </svg>
              </span>
              <span v-else class="video-player__icon">
                <svg width="16"
                     height="16"
                     viewBox="0 0 16 16"
                     fill="currentColor">
                  <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm8.07 1.22a.5.5 0 0 1 0 .706l-1.414 1.414a.5.5 0 1 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm-2.828 2.828a.5.5 0 0 1 0 .707L10.95 9.95a.5.5 0 1 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm-2.829 2.829a.5.5 0 0 1 0 .707L7.707 13.707a.5.5 0 1 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0z"/>
                </svg>
              </span>
            </button>
            
            <div
              v-show="showVolumeSlider"
              class="video-player__volume-slider"
              @mouseleave="showVolumeSlider = false"
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                :value="volume"
                @input="setVolume(parseFloat(($event.target as HTMLInputElement).value))"
              />
            </div>
          </div>
          
          <!-- Time display -->
          <div class="video-player__time">
            {{ formattedCurrentTime }} / {{ formattedDuration }}
          </div>
          
          <!-- Playback rate -->
          <div class="video-player__playback-rate-container">
            <button
              class="video-player__control-button"
              @click="showPlaybackRateSelector = !showPlaybackRateSelector"
            >
              {{ playbackRate }}x
            </button>
            
            <div
              v-show="showPlaybackRateSelector"
              class="video-player__playback-rate-selector"
            >
              <button
                v-for="rate in availablePlaybackRates"
                :key="rate"
                class="video-player__playback-rate-button"
                :class="{ 'video-player__playback-rate-button--active': playbackRate === rate }"
                @click="setPlaybackRate(rate)"
              >
                {{ rate }}x
              </button>
            </div>
          </div>
          
          <!-- Picture-in-Picture button -->
          <button class="video-player__control-button" @click="togglePictureInPicture">
            <span class="video-player__icon">
              <svg width="16"
                   height="16"
                   viewBox="0 0 16 16"
                   fill="currentColor">
                <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5v-9zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z"/>
                <path d="M8 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-3z"/>
              </svg>
            </span>
          </button>
          
          <!-- Fullscreen button -->
          <button class="video-player__control-button" @click="toggleFullscreen">
            <span v-if="isFullscreen" class="video-player__icon">
              <svg width="16"
                   height="16"
                   viewBox="0 0 16 16"
                   fill="currentColor">
                <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/>
              </svg>
            </span>
            <span v-else class="video-player__icon">
              <svg width="16"
                   height="16"
                   viewBox="0 0 16 16"
                   fill="currentColor">
                <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
              </svg>
            </span>
          </button>
        </div>
      </div>
      
      <!-- Quality selector -->
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
  user-select: none;
}

.video-player__video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
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

/* Custom controls */
.video-player__controls {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.video-player__controls--visible {
  opacity: 1;
}

.video-player__controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 5px;
}

.video-player__progress {
  width: 100%;
  height: 5px;
  background-color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  position: relative;
  border-radius: 2px;
  margin-bottom: 10px;
}

.video-player__progress-bar {
  height: 100%;
  background-color: var(--primary, #41A4FF);
  border-radius: 2px;
  position: absolute;
  top: 0;
  left: 0;
}

.video-player__control-button {
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  padding: 5px;
  margin: 0 5px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.video-player__control-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.video-player__icon {
  font-size: 1.2rem;
}

.video-player__time {
  color: white;
  font-size: 0.9rem;
  margin: 0 10px;
  flex-grow: 1;
  text-align: center;
}

/* Volume control */
.video-player__volume-container {
  position: relative;
  display: flex;
  align-items: center;
}

.video-player__volume-slider {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  height: 100px;
}

.video-player__volume-slider input {
  transform: rotate(-90deg);
  transform-origin: center;
  width: 80px;
  margin: 30px 0;
  cursor: pointer;
}

/* Playback rate selector */
.video-player__playback-rate-container {
  position: relative;
}

.video-player__playback-rate-selector {
  position: absolute;
  bottom: 100%;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.video-player__playback-rate-button {
  background-color: transparent;
  border: none;
  color: white;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 3px;
  font-size: 0.9rem;
  text-align: center;
  transition: background-color 0.2s ease;
}

.video-player__playback-rate-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.video-player__playback-rate-button--active {
  background-color: var(--primary, #41A4FF);
  color: white;
}

/* Quality selector */
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

/* Fullscreen styles */
.video-player:fullscreen {
  width: 100vw;
  height: 100vh;
}

.video-player:fullscreen .video-player__video {
  height: 100vh;
}
</style>