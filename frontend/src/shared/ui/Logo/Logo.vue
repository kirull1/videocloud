<script setup lang="ts">
defineProps({
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value: string) => ['small', 'medium', 'large'].includes(value)
  },
  colorScheme: {
    type: String,
    default: 'primary', // primary, white
    validator: (value: string) => ['primary', 'white'].includes(value)
  }
});
</script>

<template>
  <div class="logo" :class="[`logo--${size}`, `logo--${colorScheme}`]">
    <svg 
      class="logo__icon" 
      viewBox="0 0 36 36" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4"
            y="9"
            width="28"
            height="18"
            rx="2"
            class="logo__bg" />
      <path d="M22 18L16 22V14L22 18Z" fill="currentColor" />
    </svg>
    <span class="logo__text">VideoCloud</span>
  </div>
</template>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  font-family: 'Rubik', sans-serif;
  font-weight: 700;
  line-height: 1;
  gap: 8px;
}

.logo__icon {
  display: block;
}

.logo__bg {
  fill: var(--primary);
}

.logo--primary {
  color: var(--text-primary);
}

.logo--white {
  color: white;
}

.logo--white .logo__bg {
  fill: white;
}

.logo--small {
  font-size: 14px;
}

.logo--small .logo__icon {
  width: 18px;
  height: 18px;
}

.logo--medium {
  font-size: 16px;
}

.logo--medium .logo__icon {
  width: 24px;
  height: 24px;
}

.logo--large {
  font-size: 20px;
}

.logo--large .logo__icon {
  width: 32px;
  height: 32px;
}

@media (max-width: 480px) {
  .logo__text {
    display: none;
  }
}
</style>