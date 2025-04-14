# Path Aliases in VideoCloud

This document explains the path aliases configuration for the VideoCloud project, which helps improve code organization and readability by providing shorthand references to commonly used directories.

## Frontend Path Aliases

The frontend uses the following path aliases, which follow the Feature-Sliced Design (FSD) architecture:

| Alias | Path | Description |
|-------|------|-------------|
| `@/*` | `./src/*` | Root source directory |
| `@app/*` | `./src/app/*` | Application layer (entry points, global styles, providers) |
| `@pages/*` | `./src/pages/*` | Pages layer (page components, routes) |
| `@widgets/*` | `./src/widgets/*` | Widgets layer (complex UI blocks) |
| `@features/*` | `./src/features/*` | Features layer (user interactions, forms) |
| `@entities/*` | `./src/entities/*` | Entities layer (business entities) |
| `@shared/*` | `./src/shared/*` | Shared layer (UI components, utils, types) |

### Usage Examples

```typescript
// Instead of relative imports like:
import { Button } from '../../../shared/ui/Button';

// You can use path aliases:
import { Button } from '@shared/ui/Button';

// Or for app-level imports:
import { appConfig } from '@app/config';
```

## Backend Path Aliases

The backend uses the following path aliases to organize NestJS modules and components:

| Alias | Path | Description |
|-------|------|-------------|
| `@app/*` | `src/*` | Root source directory |
| `@modules/*` | `src/modules/*` | Feature modules |
| `@common/*` | `src/common/*` | Common utilities and helpers |
| `@config/*` | `src/config/*` | Configuration files |
| `@utils/*` | `src/utils/*` | Utility functions |
| `@interfaces/*` | `src/interfaces/*` | TypeScript interfaces |
| `@dto/*` | `src/dto/*` | Data Transfer Objects |
| `@entities/*` | `src/entities/*` | Database entities |
| `@repositories/*` | `src/repositories/*` | TypeORM repositories |
| `@services/*` | `src/services/*` | Service implementations |
| `@controllers/*` | `src/controllers/*` | API controllers |
| `@middleware/*` | `src/middleware/*` | HTTP middleware |
| `@guards/*` | `src/guards/*` | Authentication guards |
| `@decorators/*` | `src/decorators/*` | Custom decorators |
| `@strategies/*` | `src/strategies/*` | Authentication strategies |

### Usage Examples

```typescript
// Instead of relative imports like:
import { Logger } from '../../utils/logger';

// You can use path aliases:
import { Logger } from '@utils/logger';

// Or for configuration:
import { appConfig } from '@config/app.config';
```

## Configuration Files

The path aliases are configured in the following files:

### Frontend

1. **tsconfig.json**: Defines TypeScript path mappings
2. **tsconfig.app.json**: Extends path mappings for the app
3. **vite.config.ts**: Configures Vite to resolve the aliases

### Backend

1. **tsconfig.json**: Defines TypeScript path mappings for the backend

## Benefits

- **Improved readability**: Shorter, more meaningful import paths
- **Easier refactoring**: Moving files doesn't break import paths
- **Better organization**: Clear indication of which layer a module belongs to
- **Reduced errors**: No more "../../../" relative paths that are prone to errors
- **Consistent patterns**: Standardized import structure across the codebase
