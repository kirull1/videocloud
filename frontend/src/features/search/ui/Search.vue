<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps({
  placeholder: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['search']);

// Reference to the input element
const searchInput = ref<HTMLInputElement | null>(null);

const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('search', target.value);
};

// Handle search button click
const handleSearchButtonClick = () => {
  if (searchInput.value) {
    emit('search', searchInput.value.value);
  }
};
</script>

<template>
  <div class="search">
    <div class="search__container">
      <input
        ref="searchInput"
        type="text"
        class="search__input"
        :placeholder="placeholder || t('header.searchPlaceholder')"
        @keyup.enter="handleSearch"
      />
      <button
        class="search__button"
        :class="{ 'search__button--loading': isLoading }"
        @click="handleSearchButtonClick"
        :aria-label="t('common.search')"
      >
        <svg
          v-if="!isLoading"
          class="search__icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21"
                y1="21"
                x2="16.65"
                y2="16.65" />
        </svg>
        <div v-else class="search__loader"/>
      </button>
    </div>
  </div>
</template>

<style scoped>
.search {
  width: 100%;
}

.search__container {
  display: flex;
  position: relative;
  width: 100%;
}

.search__input {
  width: 100%;
  height: 40px;
  padding: 0 40px 0 16px;
  border-radius: 20px;
  border: 1px solid var(--panel-bg);
  background-color: var(--panel-bg);
  color: var(--text-primary);
  font-family: 'Rubik', sans-serif;
  font-size: 14px;
  transition: all 0.2s ease;
}

.search__input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(65, 164, 255, 0.2);
}

.search__button {
  position: absolute;
  right: 4px;
  top: 4px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search__button:hover {
  background-color: #3b96eb;
}

.search__icon {
  width: 16px;
  height: 16px;
}

.search__button--loading {
  cursor: wait;
}

.search__loader {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .search {
    max-width: 100%;
  }
  
  .search__input {
    height: 36px;
    font-size: 13px;
  }
  
  .search__button {
    width: 28px;
    height: 28px;
  }
  
  .search__icon {
    width: 14px;
    height: 14px;
  }
}
</style>