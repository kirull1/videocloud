<script setup lang="ts">
defineProps({
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
  }
});
</script>

<template>
  <div class="video-player">
    <video
      class="video-player__video"
      :src="src"
      :poster="poster"
      :autoplay="autoplay"
      :controls="controls"
      :loop="loop"
      :muted="muted"
      preload="metadata"
    />
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
</style>