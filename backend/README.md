# VideoCloud Backend

## Project Structure

```
src/
├── app.module.ts      # Main application module
├── main.ts            # Application entry point
├── modules/           # Feature modules (auth, users, videos)
├── common/            # Common utilities and helpers
├── config/            # Configuration files
├── utils/             # Utility functions
├── entities/          # Database entities
├── repositories/      # TypeORM repositories
├── services/          # Service implementations
├── controllers/       # API controllers
├── middleware/        # HTTP middleware
└── guards/            # Authentication guards
```

### Path Aliases

The project uses path aliases to simplify imports:

```typescript
// Instead of relative imports
import { Logger } from '../../utils/logger';

// Use path aliases
import { Logger } from '@utils/logger';
```

Available aliases:

- `@app/*` → `src/*`
- `@modules/*` → `src/modules/*`
- `@common/*` → `src/common/*`
- `@config/*` → `src/config/*`
- `@utils/*` → `src/utils/*`
- `@entities/*` → `src/entities/*`
- `@services/*` → `src/services/*`
- `@controllers/*` → `src/controllers/*`

## Requirements

### Core Technologies

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **TypeScript**: Adds static typing to JavaScript, enhancing code quality and maintainability.
- **TypeORM**: A powerful ORM for interacting with the database in an object-oriented way.
- **PostgreSQL**: The database system of choice for storing persistent data.

### Development Tools

- **Node.js** (20.16.0): Required for running the development environment and executing build processes.
- **pnpm** (7.33.6): A fast, disk space efficient package manager.

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/kirull1/videocloud.git
   cd videocloud/backend
   ```

2. **Install Dependencies**:

   ```bash
   pnpm install
   ```

3. **Configure the Environment**:

   Create a `.env` file in the root directory of the backend with the required environment variables:

   ```plaintext
   DATABASE_HOST=your-database-host
   DATABASE_PORT=your-database-port
   DATABASE_USER=your-database-user
   DATABASE_PASSWORD=your-database-password
   DATABASE_NAME=your-database-name
   JWT_SECRET=your-jwt-secret
   ```

4. **Run Database Migrations**:

   ```bash
   pnpm run typeorm migration:run
   ```

5. **Start the Development Server**:

   ```bash
   pnpm run start:dev
   ```

   Your application should now be running on `http://localhost:3000`.

## Testing

### Unit and Integration Testing

We use **Jest** as our testing framework to perform unit and integration tests, validating the functionality of individual components and their interactions.

- **Run Tests**:

  ```bash
  pnpm run test
  ```

- **Run Tests with Coverage**:
  ```bash
  pnpm run test:cov
  ```

## Key Features

- **Modular Architecture**: NestJS's modular system allows for easy separation of concerns and code organization.
- **Authentication and Authorization**: Secure endpoints with JWT-based authentication and role-based access controls.
- **RESTful API**: A robust set of RESTful endpoints for managing videos, users, and other resources.
- **Database Integration**: Seamlessly integrates with PostgreSQL using TypeORM for data persistence and transaction management.

## CI/CD

Continuous Integration and Continuous Deployment are orchestrated through **GitHub Actions**, ensuring that all changes are tested and reviewed before deployment to production environments.
