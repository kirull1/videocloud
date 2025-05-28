# VideoCloud Style Guide

This style guide outlines the coding standards and best practices for the VideoCloud project. It is based on the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with some project-specific modifications.

## Table of Contents

1. [General Principles](#general-principles)
2. [JavaScript](#javascript)
3. [TypeScript](#typescript)
4. [Vue](#vue)
5. [CSS/SCSS](#cssscss)
6. [File Structure](#file-structure)
7. [Naming Conventions](#naming-conventions)
8. [Comments](#comments)
9. [Imports](#imports)
10. [Path Aliases](#path-aliases)

## General Principles

- **Readability**: Write code that is easy to read and understand.
- **Consistency**: Follow the established patterns and conventions.
- **Simplicity**: Keep code simple and avoid unnecessary complexity.
- **Maintainability**: Write code that is easy to maintain and extend.
- **DRY (Don't Repeat Yourself)**: Avoid duplication by abstracting common functionality.

## JavaScript

We follow the Airbnb JavaScript Style Guide with the following modifications:

- **Semicolons**: No semicolons at the end of statements.
- **Quotes**: Use double quotes for strings.
- **Indentation**: Use 2 spaces for indentation.
- **Line Length**: Maximum line length is 100 characters.
- **Trailing Commas**: Use trailing commas in multiline object literals and arrays.
- **Arrow Functions**: Omit parentheses around a single parameter in arrow functions.
- **Console Statements**: Avoid `console.log()` in production code. Use `console.warn()`, `console.error()`, or `console.info()` when necessary.

```javascript
// Bad
var foo = "bar"
if (foo === "bar") {
  console.log("foo is bar")
}

// Good
const foo = "bar"
if (foo === "bar") {
  console.info("foo is bar")
}
```

## TypeScript

We follow the Airbnb TypeScript Style Guide with the following modifications:

- **Type Definitions**: Always define types for function parameters and return values.
- **Interfaces vs Types**: Prefer interfaces for object definitions and types for unions, intersections, and utility types.
- **Unused Variables**: Prefix unused variables with an underscore.
- **Explicit Any**: Avoid using `any` type. Use `unknown` instead when the type is truly unknown.

```typescript
// Bad
function getUser(id) {
  return fetch(`/api/users/${id}`).then(res => res.json())
}

// Good
interface User {
  id: number
  name: string
  email: string
}

function getUser(id: number): Promise<User> {
  return fetch(`/api/users/${id}`).then(res => res.json())
}

// Unused parameters
function processItems(items: string[], _options: unknown): void {
  items.forEach(item => console.info(item))
}
```

## Vue

We follow the Vue.js Style Guide with the following modifications:

- **Component Names**: Use PascalCase for component names in templates.
- **Component Files**: Use PascalCase for single-file component filenames.
- **Props**: Always use camelCase for prop names and provide default values.
- **Events**: Use kebab-case for event names and document emitted events with `defineEmits`.
- **Slots**: Use kebab-case for slot names.
- **Self-closing Components**: Always use self-closing syntax for components without content.

```vue
<!-- Bad -->
<template>
  <div>
    <userProfile :user-name="user.name" @update:user="updateUser"></userProfile>
  </div>
</template>

<!-- Good -->
<template>
  <div>
    <UserProfile :userName="user.name" @update-user="updateUser" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue"
  import UserProfile from "@/components/UserProfile.vue"

  interface User {
    id: number
    name: string
  }

  const user = ref<User>({ id: 1, name: "John Doe" })

  const updateUser = (newUser: User): void => {
    user.value = newUser
  }
</script>
```

## CSS/SCSS

- **Class Names**: Use kebab-case for class names.
- **Selectors**: Avoid deep nesting of selectors (maximum 3 levels).
- **Variables**: Use CSS variables for theming and reusable values.
- **Units**: Use relative units (rem, em, %) instead of absolute units (px) when possible.
- **Media Queries**: Use mobile-first approach for responsive design.

```scss
// Bad
.userCard {
  .userName {
    font-size: 16px;
    .userTitle {
      color: #333;
    }
  }
}

// Good
.user-card {
  &__name {
    font-size: 1rem;
  }

  &__title {
    color: var(--text-color);
  }
}
```

## File Structure

Follow the Feature-Sliced Design (FSD) methodology for organizing code:

```
src/
├── app/        # Application initialization, global styles
├── pages/      # Application routes and layouts
├── widgets/    # Composite components for business features
├── features/   # User interactions, actions
├── entities/   # Business entities
└── shared/     # Reusable code, UI kit, API, etc.
```

## Naming Conventions

- **Files and Directories**:

  - Vue components: PascalCase (e.g., `UserProfile.vue`)
  - JavaScript/TypeScript files: camelCase (e.g., `userService.ts`)
  - Test files: Same name as the file being tested with `.spec` or `.test` suffix (e.g., `userService.spec.ts`)
  - CSS/SCSS files: Same name as the component they style (e.g., `UserProfile.scss`)

- **Variables and Functions**:
  - Variables: camelCase (e.g., `userName`)
  - Functions: camelCase (e.g., `getUserData()`)
  - Classes and Interfaces: PascalCase (e.g., `UserProfile`, `UserData`)
  - Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)

## Comments

- **Code Comments**: Use comments to explain why, not what. The code should be self-explanatory.
- **Documentation Comments**: Use JSDoc for documenting functions, classes, and interfaces.
- **TODO Comments**: Use `TODO:` prefix for tasks that need to be completed.
- **FIXME Comments**: Use `FIXME:` prefix for code that needs to be fixed.

```typescript
/**
 * Fetches user data from the API
 * @param id - The user ID
 * @returns A promise that resolves to the user data
 */
function getUser(id: number): Promise<User> {
  // TODO: Add caching mechanism
  return fetch(`/api/users/${id}`).then(res => res.json())
}
```

## Imports

- **Import Order**: Group imports in the following order:
  1. External libraries
  2. Internal modules
  3. Types
  4. Assets

```typescript
// External libraries
import { ref, computed } from "vue"
import axios from "axios"

// Internal modules
import { useUserStore } from "@/stores/user"
import UserAvatar from "@/components/UserAvatar.vue"

// Types
import type { User, UserRole } from "@/types"

// Assets
import userIcon from "@/assets/icons/user.svg"
```

## Path Aliases

Use path aliases to avoid deep relative imports:

```typescript
// Bad
import { Button } from "../../../shared/ui/Button"

// Good
import { Button } from "@shared/ui/Button"
```

Available path aliases:

- Frontend:

  - `@/*` → `./src/*`
  - `@app/*` → `./src/app/*`
  - `@pages/*` → `./src/pages/*`
  - `@widgets/*` → `./src/widgets/*`
  - `@features/*` → `./src/features/*`
  - `@entities/*` → `./src/entities/*`
  - `@shared/*` → `./src/shared/*`

- Backend:
  - `@app/*` → `src/*`
  - `@modules/*` → `src/modules/*`
  - `@common/*` → `src/common/*`
  - `@config/*` → `src/config/*`
  - `@utils/*` → `src/utils/*`
  - `@entities/*` → `src/entities/*`
  - `@services/*` → `src/services/*`
  - `@controllers/*` → `src/controllers/*`
