# Text Component

A versatile text component with customizable size, weight, and color.

## Props

| Prop    | Type   | Default   | Description                                                |
|---------|--------|-----------|-----------------------------------------------------------|
| content | String | Required  | The text content to display                               |
| size    | String | 'medium'  | Size of the text ('small', 'medium', 'large')             |
| weight  | String | 'normal'  | Weight of the text ('normal', 'bold')                     |
| color   | String | 'default' | Color of the text ('default', 'primary', 'secondary', 'error') |

## Usage

```vue
<script setup>
import Text from '@shared/ui/Text';
</script>

<template>
  <Text content="Hello, world!" />
  <Text content="Small text" size="small" />
  <Text content="Large text" size="large" />
  <Text content="Bold text" weight="bold" />
  <Text content="Primary color" color="primary" />
</template>
```

## Storybook

View the component in Storybook:

```bash
pnpm run storybook
```

Then navigate to the Text component in the sidebar.

## Screenshot Testing

This component includes screenshot tests for both mobile and desktop viewports. The tests capture screenshots of each variant of the component and store them in the `__screenshots__` directory.

### Running Screenshot Tests

There are several ways to run the screenshot tests:

1. **Automated way (recommended)**:
   This script will start Storybook, run the tests, and then shut down Storybook:
   ```bash
   pnpm run test:screenshots:all
   ```

2. **Manual way**:
   - Start Storybook in one terminal:
     ```bash
     pnpm run storybook
     ```
   - In another terminal, run the screenshot tests:
     ```bash
     pnpm run test:screenshots
     ```

### Screenshot Directory Structure

Screenshots are stored in the `__screenshots__` directory next to the component:

```
Text/
├── Text.vue
├── index.ts
├── Text.stories.ts
├── Text.spec.ts
├── README.md
└── __screenshots__/
    ├── text-default-desktop.png
    ├── text-default-mobile.png
    ├── text-small-desktop.png
    ├── text-small-mobile.png
    └── ...
```

### Updating Screenshots

If you make changes to the component that intentionally change its appearance, you'll need to update the screenshots:

1. **Automated way (recommended)**:
   ```bash
   pnpm run test:screenshots:update
   ```

2. **Manual way**:
   - Start Storybook in one terminal:
     ```bash
     pnpm run storybook
     ```
   - In another terminal, update the screenshots:
     ```bash
     pnpm run test:screenshots:update
     ```