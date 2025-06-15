<template>
  <div class="about">
    <div class="about-container">
      <h1 class="about-title">{{ $t('pages.about.title') }}</h1>
      <p class="about-content">{{ $t('pages.about.content') }}</p>
      
      <div class="features-section">
        <h2 class="features-title">{{ $t('pages.about.featuresTitle') }}</h2>
        <ul class="features-list">
          <li class="feature-item">{{ $t('pages.about.feature1') }}</li>
          <li class="feature-item">{{ $t('pages.about.feature2') }}</li>
          <li class="feature-item">{{ $t('pages.about.feature3') }}</li>
          <li class="feature-item">{{ $t('pages.about.feature4') }}</li>
        </ul>
      </div>
      
      <div class="contact-section">
        <h2 class="contact-title">{{ $t('pages.about.contactTitle') }}</h2>
        <p class="contact-text">{{ $t('pages.about.contactText') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.about-container {
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.about-title {
  margin-bottom: 1.5rem;
  color: var(--text-primary, #1A2233);
  font-size: 2rem;
}

.about-content {
  line-height: 1.6;
  margin-bottom: 2rem;
  color: var(--text-primary, #1A2233);
  text-align: left;
}

.features-section {
  margin-bottom: 2rem;
  text-align: left;
}

.features-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary, #1A2233);
}

.features-list {
  list-style-type: none;
  padding: 0;
}

.feature-item {
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
  position: relative;
  padding-left: 1.5rem;
  color: var(--text-primary, #1A2233);
}

.feature-item::before {
  content: "•";
  color: var(--primary, #41A4FF);
  font-size: 1.5rem;
  position: absolute;
  left: 0;
  top: 0.2rem;
}

.contact-section {
  text-align: left;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.contact-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary, #1A2233);
}

.contact-text {
  line-height: 1.6;
  color: var(--text-primary, #1A2233);
}

@media (max-width: 768px) {
  .about {
    padding: 1rem;
  }
  
  .about-container {
    padding: 1.5rem;
  }
  
  .about-title {
    font-size: 1.5rem;
  }
  
  .features-title,
  .contact-title {
    font-size: 1.25rem;
  }
}
</style>
