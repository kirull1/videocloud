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
- Multer for file uploads
- AWS SDK for S3 integration

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

# S3 Storage
YANDEX_CLOUD_REGION=ru-central1
YANDEX_CLOUD_S3_ENDPOINT=https://storage.yandexcloud.net
YANDEX_CLOUD_S3_BUCKET=videocloud-bucket
YANDEX_CLOUD_ACCESS_KEY_ID=your-access-key-id
YANDEX_CLOUD_SECRET_ACCESS_KEY=your-secret-access-key
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
│   ├── shared/
│   │   └── services/
│   │       └── s3.service.ts
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
    "@nestjs/platform-express": "^10.0.0",
    "@aws-sdk/client-s3": "^3.0.0",
    "@aws-sdk/s3-request-presigner": "^3.0.0",
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
- GET /users/profile - Get user profile
- PATCH /users/profile - Update user profile
- POST /users/avatar - Upload user avatar
- PATCH /users/password - Change user password
- POST /users/verify-email - Request email verification
- POST /users/verify-email/:token - Verify email

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

## File Storage

### S3 Integration
- Using AWS SDK for S3 to interact with Yandex Cloud Object Storage
- Configured with region, endpoint, access key, and secret key
- Bucket structure:
  - avatars/ - User avatar images
  - videos/ - Video files
  - thumbnails/ - Video thumbnails

### File Upload
- Using Multer for file upload handling
- Memory storage (not disk storage) for file uploads
- File validation for type and size
- Direct streaming to S3 from memory

### Avatar Upload
- Maximum file size: 2MB
- Allowed file types: jpg, jpeg, png, gif, webp
- Unique filename generation based on hash and timestamp
- Public read access for avatar files
- URL format: https://{bucket}.storage.yandexcloud.net/{key}

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
- Custom avatar upload functionality is now fixed and working correctly
- File uploads are now properly handled with memory storage instead of disk storage
- S3 integration is working correctly for avatar storage
- Next focus should be on video upload and processing
- Need to implement proper testing for all new features
- Need to add proper documentation for all new features
- Need to implement proper security measures for all new features
- Need to add proper logging system for all new features
