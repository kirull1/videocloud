<script setup lang="ts">
// Import styles
import './assets/error-page.css';

const allowStatus = {
  'not-found': {
    statusCode: '404',
    title: 'Page Not Found',
    buttonTitle: 'Go Home',
    isReload: false,
  },
  'server-error': {
    statusCode: '500',
    title: 'Internal Server Error',
    buttonTitle: 'Try Again',
    isReload: true,
  },
  'forbidden': {
    statusCode: '403',
    title: 'Forbidden',
    buttonTitle: 'Go Home',
    isReload: false,
  },
  'service-unavailable': {
    statusCode: '503',
    title: 'Service Unavailable',
    buttonTitle: 'Try Again',
    isReload: true,
  }
} as const;

// Function to get user language preference
const getUserLanguage = (): 'en' | 'ru' => {
  // Try to get from localStorage
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage === 'en' || savedLanguage === 'ru') {
    return savedLanguage;
  }
  
  // Try to get from browser
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'ru') {
    return 'ru';
  }
  
  // Default to English
  return 'en';
};

// Translations for error pages
const translations = {
  en: {
    'not-found': {
      title: '404 - Page Not Found',
      message: 'The page you are looking for does not exist',
      buttonTitle: 'Go Home'
    },
    'server-error': {
      title: '500 - Server Error',
      message: 'Something went wrong on our end',
      buttonTitle: 'Try Again'
    },
    'forbidden': {
      title: '403 - Forbidden',
      message: 'You do not have permission to access this page',
      buttonTitle: 'Go Home'
    },
    'service-unavailable': {
      title: '503 - Service Unavailable',
      message: 'Service is temporarily unavailable',
      buttonTitle: 'Try Again'
    }
  },
  ru: {
    'not-found': {
      title: '404 - Страница не найдена',
      message: 'Запрашиваемая страница не существует',
      buttonTitle: 'На главную'
    },
    'server-error': {
      title: '500 - Ошибка сервера',
      message: 'Что-то пошло не так на нашей стороне',
      buttonTitle: 'Попробовать снова'
    },
    'forbidden': {
      title: '403 - Доступ запрещен',
      message: 'У вас нет прав для доступа к этой странице',
      buttonTitle: 'На главную'
    },
    'service-unavailable': {
      title: '503 - Сервис недоступен',
      message: 'Сервис временно недоступен',
      buttonTitle: 'Попробовать снова'
    }
  }
};

const userLang = getUserLanguage();
const urlParams = new URLSearchParams(window.location.search);
const statusKey = urlParams.get('status') as keyof typeof allowStatus || 'server-error';
const status = allowStatus[statusKey];

// Get translations for the current status and language
const t = translations[userLang][statusKey];

const buttonLink = status.isReload ? window.location.pathname + window.location.search : '/';
</script>

<template>
  <div class="error-page">
    <!-- Decorative elements -->
    <div class="decorative-element curve-1"></div>
    <div class="decorative-element curve-2"></div>
    <div class="decorative-element curve-3"></div>
    <div class="decorative-element curve-4"></div>
    <div class="decorative-element curve-5"></div>
    <div class="decorative-element curve-6"></div>
    
    <div class="decorative-element triangle-1"></div>
    <div class="decorative-element triangle-2"></div>
    
    <div class="content">
      <h1 class="error-code">{{ status.statusCode }}</h1>
      <p class="error-message">{{ t.message }}</p>
      <a v-bind:href="buttonLink" class="home-button">{{ t.buttonTitle }}</a>
    </div>
  </div>
</template>