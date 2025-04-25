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

const urlParams = new URLSearchParams(window.location.search);
const status = allowStatus[urlParams.get('status') as keyof typeof allowStatus] || allowStatus['server-error'];

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
      <p class="error-message">Whoops... {{ status.title }}</p>
      <a v-bind:href="buttonLink" class="home-button">{{ status.buttonTitle }}</a>
    </div>
  </div>
</template>