import { ref, computed } from 'vue';
import type { Tag } from './types';
import { tagApi } from '../api/tagApi';

const tags = ref<Tag[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

export const tagStore = {
  tags: computed(() => tags.value),
  loading: computed(() => loading.value),
  error: computed(() => error.value),

  async fetchTags() {
    loading.value = true;
    error.value = null;

    try {
      tags.value = await tagApi.getTags();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tags';
      console.error('Error fetching tags:', err);
    } finally {
      loading.value = false;
    }
  },

  async fetchTag(id: string) {
    loading.value = true;
    error.value = null;

    try {
      const tag = await tagApi.getTag(id);
      
      // Update the tag in the list if it exists
      const index = tags.value.findIndex(t => t.id === id);
      if (index !== -1) {
        tags.value[index] = tag;
      } else {
        tags.value.push(tag);
      }
      
      return tag;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tag';
      console.error('Error fetching tag:', err);
      return null;
    } finally {
      loading.value = false;
    }
  },

  getTagById(id: string) {
    return tags.value.find(tag => tag.id === id) || null;
  },

  getTagBySlug(slug: string) {
    return tags.value.find(tag => tag.slug === slug) || null;
  },

  getTagsByIds(ids: string[]) {
    return tags.value.filter(tag => ids.includes(tag.id));
  },

  reset() {
    tags.value = [];
    loading.value = false;
    error.value = null;
  }
};