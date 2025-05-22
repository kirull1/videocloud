<template>
  <div class="reaction-buttons">
    <button
      class="reaction-button"
      :class="{ active: userReaction === 'like' }"
      :disabled="isLoading"
      aria-label="Like"
      @click="handleLike"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
      </svg>
      <span class="reaction-count">{{ likesCount }}</span>
    </button>
    <button
      class="reaction-button"
      :class="{ active: userReaction === 'dislike' }"
      :disabled="isLoading"
      aria-label="Dislike"
      @click="handleDislike"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/>
      </svg>
      <span class="reaction-count">{{ dislikesCount }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { reactionStore, ReactionType } from '@/entities/reaction';

const props = defineProps<{
  videoId: string;
}>();

const isLoading = computed(() => reactionStore.isLoading);
const error = computed(() => reactionStore.error);

const videoReactions = computed(() => {
  return reactionStore.getReactionsForVideo(props.videoId);
});

const likesCount = computed(() => {
  return videoReactions.value?.likesCount || 0;
});

const dislikesCount = computed(() => {
  return videoReactions.value?.dislikesCount || 0;
});

const userReaction = computed(() => {
  return videoReactions.value?.userReaction;
});

const handleLike = () => {
  reactionStore.toggleReaction(props.videoId, ReactionType.LIKE);
};

const handleDislike = () => {
  reactionStore.toggleReaction(props.videoId, ReactionType.DISLIKE);
};

onMounted(async () => {
  await reactionStore.getVideoReactions(props.videoId);
});

watch(
  () => props.videoId,
  async (newVideoId) => {
    if (newVideoId) {
      await reactionStore.getVideoReactions(newVideoId);
    }
  }
);
</script>

<style scoped>
.reaction-buttons {
  display: flex;
  gap: 16px;
  margin: 16px 0;
}

.reaction-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background-color: var(--panel-bg, #E6F0FB);
  color: var(--text-secondary, #67748B);
  cursor: pointer;
  transition: all 0.2s ease;
}

.reaction-button:hover {
  background-color: var(--hover-bg, #EAF9F7);
}

.reaction-button.active {
  background-color: var(--primary, #41A4FF);
  color: white;
}

.reaction-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reaction-count {
  font-weight: 500;
}
</style>