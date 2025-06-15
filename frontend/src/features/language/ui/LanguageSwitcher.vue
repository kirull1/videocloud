<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { availableLocales, setLocale } from '@/shared/config/i18n.config'

const { t, locale } = useI18n()

const isOpen = ref(false)
const selectedLocale = ref(locale.value)

const currentLanguage = computed(() => {
  const localeObj = availableLocales.find(l => l.code === selectedLocale.value)
  return localeObj ? t(`language.${localeObj.code === 'en' ? 'english' : 'russian'}`) : t('language.english')
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const changeLanguage = (localeCode: string) => {
  selectedLocale.value = localeCode
  setLocale(localeCode)
  closeDropdown()
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.language-switcher')) {
    closeDropdown()
  }
}

// Add and remove event listener
watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>

<template>
  <div class="language-switcher">
    <button 
      class="language-switcher__button" 
      @click.stop="toggleDropdown"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      :title="$t('language.switchLanguage')"
    >
      <span class="language-switcher__current">{{ currentLanguage }}</span>
      <span class="language-switcher__icon" :class="{ 'language-switcher__icon--open': isOpen }">▼</span>
    </button>
    
    <div v-if="isOpen" class="language-switcher__dropdown">
      <button
        v-for="locale in availableLocales"
        :key="locale.code"
        class="language-switcher__option"
        :class="{ 'language-switcher__option--active': selectedLocale === locale.code }"
        @click="changeLanguage(locale.code)"
      >
        {{ $t(`language.${locale.code === 'en' ? 'english' : 'russian'}`) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.language-switcher {
  position: relative;
  display: inline-block;
}

.language-switcher__button {
  display: flex;
  align-items: center;
  background: transparent;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-color, #333);
  transition: all 0.2s ease;
}

.language-switcher__button:hover {
  background-color: var(--hover-bg, #f5f5f5);
}

.language-switcher__current {
  margin-right: 8px;
}

.language-switcher__icon {
  font-size: 10px;
  transition: transform 0.2s ease;
}

.language-switcher__icon--open {
  transform: rotate(180deg);
}

.language-switcher__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  min-width: 120px;
  margin-top: 4px;
  background-color: var(--bg-color, #fff);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.language-switcher__option {
  display: block;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-color, #333);
  transition: background-color 0.2s ease;
}

.language-switcher__option:hover {
  background-color: var(--hover-bg, #f5f5f5);
}

.language-switcher__option--active {
  background-color: var(--active-bg, #e6f7ff);
  font-weight: 500;
}
</style> 