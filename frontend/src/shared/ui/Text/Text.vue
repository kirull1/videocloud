<script setup lang="ts">
defineProps({
  /**
   * The text content to display
   */
  content: {
    type: String,
    required: true
  },
  /**
   * The size of the text
   */
  size: {
    type: String,
    default: 'medium',
    validator: (value: string) => ['small', 'medium', 'large'].includes(value)
  },
  /**
   * The weight of the text
   */
  weight: {
    type: String,
    default: 'normal',
    validator: (value: string) => ['normal', 'bold'].includes(value)
  },
  /**
   * The color of the text
   */
  color: {
    type: String,
    default: 'default',
    validator: (value: string) => ['default', 'primary', 'secondary', 'error'].includes(value)
  }
});
</script>

<template>
  <p :class="['text', `text--size-${size}`, `text--weight-${weight}`, `text--color-${color}`]">
    {{ content }}
  </p>
</template>

<style scoped>
.text {
  margin: 0;
  padding: 0;
}

.text--size-small {
  font-size: 0.875rem;
}

.text--size-medium {
  font-size: 1rem;
}

.text--size-large {
  font-size: 1.25rem;
}

.text--weight-normal {
  font-weight: 400;
}

.text--weight-bold {
  font-weight: 700;
}

.text--color-default {
  color: #333;
}

.text--color-primary {
  color: #007bff;
}

.text--color-secondary {
  color: #6c757d;
}

.text--color-error {
  color: #dc3545;
}
</style>