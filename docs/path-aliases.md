# Path Aliases in VideoCloud

## Frontend Structure (FSD Architecture)

```
src/
├── app/        # Application initialization, global styles
├── pages/      # Application routes and layouts
├── widgets/    # Composite components for business features
├── features/   # User interactions, actions
├── entities/   # Business entities
└── shared/     # Reusable code, UI kit, API, etc.
```

### Frontend Path Aliases

| Alias         | Path               |
| ------------- | ------------------ |
| `@/*`         | `./src/*`          |
| `@app/*`      | `./src/app/*`      |
| `@pages/*`    | `./src/pages/*`    |
| `@widgets/*`  | `./src/widgets/*`  |
| `@features/*` | `./src/features/*` |
| `@entities/*` | `./src/entities/*` |
| `@shared/*`   | `./src/shared/*`   |

### Example

```typescript
import { appConfig } from '@/shared/config/app.config'
```

## Backend Structure (NestJS)

```
src/
├── modules/    # Feature modules (auth, users, videos)
├── common/     # Common utilities
├── config/     # Configuration files
├── utils/      # Utility functions
├── entities/   # Database entities
├── services/   # Service implementations
└── controllers/# API controllers
```

### Backend Path Aliases

| Alias            | Path                |
| ---------------- | ------------------- |
| `@app/*`         | `src/*`             |
| `@modules/*`     | `src/modules/*`     |
| `@common/*`      | `src/common/*`      |
| `@config/*`      | `src/config/*`      |
| `@utils/*`       | `src/utils/*`       |
| `@entities/*`    | `src/entities/*`    |
| `@services/*`    | `src/services/*`    |
| `@controllers/*` | `src/controllers/*` |

### Example

```typescript
import { appConfig } from '@config/app.config'
```
