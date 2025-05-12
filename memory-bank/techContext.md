# VideoCloud Technical Context

## Technology Stack

### Frontend
- Vue 3 with Composition API
- TypeScript
- CSS Modules
- Vite
- Vitest for testing
- Playwright for E2E testing

### Backend
- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- JWT for authentication
- bcrypt for password hashing

### Development Tools
- pnpm for package management
- ESLint for linting
- Prettier for code formatting
- Git for version control
- Docker for containerization

## Development Environment

### Required Software
- Node.js 22.14.0
- pnpm 10.8.1
- PostgreSQL 16
- Docker (optional)

### Environment Variables
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=videocloud

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRATION=1d

# CORS
CORS_ORIGIN=http://localhost:5173
```

## Project Structure

### Frontend
```
frontend/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   ├── ui/
│   │   │   └── model/
│   │   └── ...
│   ├── shared/
│   │   ├── lib/
│   │   ├── ui/
│   │   └── api/
│   └── app/
└── ...
```

### Backend
```
backend/
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   ├── guards/
│   │   └── strategies/
│   ├── users/
│   │   ├── dto/
│   │   └── entities/
│   ├── config/
│   └── migrations/
└── ...
```

## Dependencies

### Frontend Dependencies
```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

### Backend Dependencies
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "bcrypt": "^5.1.0",
    "pg": "^8.11.0",
    "typeorm": "^0.3.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0"
  }
}
```

## API Endpoints

### Authentication
- POST /auth/register - Register new user
- POST /auth/login - Login user
- POST /auth/logout - Logout user
- GET /auth/me - Get current user

### Users
- GET /users/:id - Get user by ID
- PATCH /users/:id - Update user
- DELETE /users/:id - Delete user

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  isEmailVerified BOOLEAN DEFAULT false,
  avatarUrl VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

### Frontend Testing
- Unit tests with Vitest
- Component tests with Vue Test Utils
- E2E tests with Playwright
- Visual regression tests

### Backend Testing
- Unit tests with Jest
- Integration tests
- API tests
- Database tests

## Deployment

### Frontend Deployment
- Static file hosting
- CDN integration
- Build optimization
- Environment configuration

### Backend Deployment
- Container deployment
- Database migrations
- Environment setup
- Monitoring setup

## Security

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes
- Input validation

### Data Protection
- Environment variables
- Secure headers
- CORS configuration
- Rate limiting

## Monitoring

### Application Monitoring
- Error tracking
- Performance monitoring
- User analytics
- System health checks

### Logging
- Error logging
- Access logging
- Audit logging
- Debug logging

## Notes
- Authentication system is now implemented with proper validation and error handling
- Avatar generation system is in place with fallback mechanism
- Next focus should be on user profile management and email verification
- Need to implement proper testing for all new features
- Need to add proper documentation for all new features
- Need to implement proper security measures for all new features
- Need to add proper logging system for all new features
