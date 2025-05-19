import { ref, computed } from 'vue';
import type { Category } from './types';
import { categoryApi } from '../api/categoryApi';

const categories = ref<Category[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

export const categoryStore = {
  categories: computed(() => categories.value),
  loading: computed(() => loading.value),
  error: computed(() => error.value),

  async fetchCategories() {
    loading.value = true;
    error.value = null;

    try {
      categories.value = await categoryApi.getCategories();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch categories';
      console.error('Error fetching categories:', err);
    } finally {
      loading.value = false;
    }
  },

  async fetchCategory(id: string) {
    loading.value = true;
    error.value = null;

    try {
      const category = await categoryApi.getCategory(id);
      
      // Update the category in the list if it exists
      const index = categories.value.findIndex(c => c.id === id);
      if (index !== -1) {
        categories.value[index] = category;
      } else {
        categories.value.push(category);
      }
      
      return category;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch category';
      console.error('Error fetching category:', err);
      return null;
    } finally {
      loading.value = false;
    }
  },

  getCategoryById(id: string) {
    return categories.value.find(category => category.id === id) || null;
  },

  getCategoryBySlug(slug: string) {
    return categories.value.find(category => category.slug === slug) || null;
  },

  reset() {
    categories.value = [];
    loading.value = false;
    error.value = null;
  }
};