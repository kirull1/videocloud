import { createI18n } from 'vue-i18n'
import en from '../locales/en'
import ru from '../locales/ru'
import { appConfig } from './app.config'

export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || appConfig.ui.defaultLanguage,
  fallbackLocale: 'en',
  messages: {
    en,
    ru
  }
})

export const availableLocales = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' }
]

export const setLocale = (locale: string) => {
  i18n.global.locale.value = locale
  localStorage.setItem('language', locale)
  document.querySelector('html')?.setAttribute('lang', locale)
} 