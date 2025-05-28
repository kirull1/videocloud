---
id: logo
title: VideoCloud Logo
sidebar_position: 1
---

# VideoCloud Logo

The VideoCloud logo is a key part of our brand identity. This document provides guidelines for using the logo in documentation and other materials.

## Logo Design

The VideoCloud logo consists of two elements:
1. A play button icon in a circle
2. The "VideoCloud" text

### SVG Code

```svg
<svg
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg">
  <path
    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"
    fill="currentColor"
  />
</svg>
```

## Usage Guidelines

### Colors

The logo should be used in the following colors:

- Primary: `#2e8555` (light theme)
- Primary: `#25c2a0` (dark theme)
- White: For light backgrounds
- Black: For dark backgrounds

### Sizing

- Minimum size: 24x24 pixels
- Recommended size: 32x32 pixels
- Maximum size: 48x48 pixels

### Spacing

- Maintain clear space around the logo
- Minimum clear space: Equal to the height of the logo
- Do not place other elements within the clear space

### Placement

- Use in the top-left corner of the documentation
- Link to the homepage when used as a navigation element
- Maintain consistent placement across all pages

## Implementation

The logo is implemented as a React component in the documentation theme. It automatically adapts to the current theme (light/dark) and includes proper accessibility attributes.

### Component Usage

```jsx
import Logo from '@theme/Logo';

<Logo />
```

### Customization

The logo can be customized through the Docusaurus configuration:

```js
// docusaurus.config.js
module.exports = {
  themeConfig: {
    logo: {
      alt: 'VideoCloud Logo',
      src: 'img/logo.svg',
      srcDark: 'img/logo-dark.svg',
    },
  },
};
```

## Accessibility

- The logo includes proper alt text for screen readers
- The SVG is optimized for accessibility
- Color contrast meets WCAG 2.1 standards

## Download

- [Logo (SVG)](/img/logo.svg)
- [Logo (PNG)](/img/logo.png)
- [Logo (Dark Theme)](/img/logo-dark.svg)

## Brand Guidelines

For complete brand guidelines, including logo usage, colors, and typography, please refer to the [Brand Guidelines](/docs/brand/guidelines). 