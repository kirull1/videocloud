<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true
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
  height: {
    type: [String, Number],
    default: 'auto'
  },
  width: {
    type: [String, Number],
    default: '100%'
  },
  fluid: {
    type: Boolean,
    default: true
  },
  playbackRates: {
    type: Array as () => number[],
    default: () => [0.5, 1, 1.5, 2]
  }
});

const emit = defineEmits([
  'play',
  'pause',
  'ended',
  'timeupdate',
  'volumechange',
  'ready'
]);

const videoRef = ref<HTMLElement | null>(null);
const player = ref<any>(null);

const initializePlayer = () => {
  if (!videoRef.value) return;
  
  const videoElement = videoRef.value as HTMLVideoElement;
  videoElement.addEventListener('play', () => emit('play'));
  videoElement.addEventListener('pause', () => emit('pause'));
  videoElement.addEventListener('ended', () => emit('ended'));
  videoElement.addEventListener('timeupdate', () => emit('timeupdate', videoElement.currentTime));
  videoElement.addEventListener('volumechange', () => emit('volumechange', videoElement.volume));
  
  emit('ready', videoElement);
};

watch(() => props.src, (newSrc) => {
  if (player.value) {
    if (videoRef.value) {
      (videoRef.value as HTMLVideoElement).src = newSrc;
      (videoRef.value as HTMLVideoElement).load();
    }
  }
});

onMounted(() => {
  initializePlayer();
});

onBeforeUnmount(() => {
  if (player.value) {
    if (videoRef.value) {
      const videoElement = videoRef.value as HTMLVideoElement;
      videoElement.removeEventListener('play', () => emit('play'));
      videoElement.removeEventListener('pause', () => emit('pause'));
      videoElement.removeEventListener('ended', () => emit('ended'));
      videoElement.removeEventListener('timeupdate', () => emit('timeupdate', videoElement.currentTime));
      videoElement.removeEventListener('volumechange', () => emit('volumechange', videoElement.volume));
    }
  }
});
</script>

<template>
  <div class="video-player">
    <video
      ref="videoRef"
      :src="src"
      :poster="poster"
      :autoplay="autoplay"
      :controls="controls"
      :loop="loop"
      :muted="muted"
      :height="height"
      :width="width"
      class="video-player__native"
    />
  </div>
</template>

<style scoped>
.video-player {
  width: 100%;
  position: relative;
  background-color: var(--player-bg, #000);
  overflow: hidden;
  border-radius: 8px;
}

.video-player__native {
  width: 100%;
  height: auto;
  max-width: 100%;
  display: block;
}
</style>