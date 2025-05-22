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
- fluent-ffmpeg for video processing
- @ffprobe-installer/ffprobe for media metadata extraction

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
- GET /users/:id/avatar - Get user avatar (redirects to actual avatar or generates default)
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

### Avatar Retrieval
- Dedicated endpoint: GET /api/users/:id/avatar
- Redirects to actual avatar URL if user has uploaded a custom avatar
- Generates default avatar using DiceBear API if no custom avatar exists
- Consistent avatar display across the application
- Frontend uses the avatar endpoint instead of directly accessing userAvatarUrl field

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
- Avatar retrieval endpoint has been implemented for consistent avatar display
- Frontend now uses the avatar endpoint instead of directly accessing userAvatarUrl field
- Video duration is displayed in the bottom-right corner of video thumbnails in MM:SS format
- Duration is calculated from the video.duration field (in seconds)
- VideoCard component handles null/undefined duration values gracefully
- Fixed issue where video duration was not appearing correctly by updating database values
- Implemented automatic video duration calculation during upload using HTML5 video element
- Added visual feedback during duration calculation with loading indicator
- Shows calculated duration in the upload form with clock icon
- Modified video upload process to include duration in the metadata sent to the server
- Updated backend CreateVideoDto to accept duration parameter from frontend
- Replaced `get-video-duration` with `fluent-ffmpeg` and `@ffprobe-installer/ffprobe` for reliable duration calculation
- Created a utility class `VideoDurationUtil` to handle duration calculation on the server
- Server-side duration calculation works as a fallback if client-side calculation fails
- Implemented a dual-layer approach: client-side calculation for immediate feedback, server-side for reliability
- Fixed permission issues by:
  - Setting appropriate file permissions (0o666) on temporary video files
  - Setting execute permission (0o755) on the ffprobe executable
  - Using a custom temporary directory within the project
- Added detailed logging for debugging duration calculation
- Implemented robust error handling and cleanup of temporary files
- Implemented a comprehensive video processing pipeline that:
  - Transcodes videos to different formats (MP4, WebM)
  - Creates different quality variants (720p, 480p, 360p)
  - Generates thumbnails at strategic points in the video
  - Updates video status as it progresses through the pipeline
- Video processing runs in the background after initial upload
- Uses fluent-ffmpeg for reliable video processing
- Implements proper error handling and logging throughout the pipeline
- Creates adaptive streaming variants for different network conditions
- Handles cleanup of temporary files after processing
- Implemented adaptive video streaming with:
  - Backend VideoPlayerService for streaming information
  - Frontend VideoPlayer component with quality selection
  - Support for multiple formats (MP4, HLS, DASH)
  - Quality variants (720p, 480p, 360p)
  - Client-side quality switching without interrupting playback
- Enhanced the VideoPlayer component with advanced features:
  - Custom playback controls with modern UI
  - Progress bar with seek functionality
  - Volume control with mute toggle
  - Playback speed adjustment (0.25x to 2x)
  - Fullscreen mode with proper scaling
  - Picture-in-Picture support
  - Keyboard shortcuts for all controls
  - Auto-hiding controls during playback
  - Responsive design for all screen sizes
- Implemented content organization features:
  - Category and tag entities with proper database relationships
  - One-to-many relationship between categories and videos
  - Many-to-many relationship between tags and videos
  - Category and tag display on video cards and detail pages
  - Filtering by categories and tags on the home page
  - Responsive filter UI with horizontal scrolling on mobile
  - Visual feedback for selected filters
  - Consistent styling for categories and tags
- Implemented advanced search functionality:
  - Created dedicated search page with comprehensive filtering
  - Added search query parameter support in the router
  - Implemented search functionality in the header across all pages
  - Enhanced the search results display with category and tag filters
  - Added empty state handling with helpful suggestions
  - Implemented loading state and error handling for search operations
  - Ensured responsive design for all screen sizes
  - Integrated with existing category and tag filtering
- Implemented comments system with:
  - Backend API for creating, reading, updating, and deleting comments
  - Database schema with self-referencing relationship for nested replies
  - Frontend components for displaying and interacting with comments
  - Support for nested replies with proper threading
  - Comment editing and deletion with proper authorization
  - User-friendly comment form with validation
  - Loading states and error handling for all comment operations
  - Responsive design for all screen sizes
  - Integration with the video detail page
- Implemented user channel pages system with:
  - Backend API for creating, retrieving, updating, and deleting channels
  - Database schema with one-to-one relationship between users and channels
  - Frontend components for displaying and interacting with channels
  - Support for channel customization (name, description, custom URL, theme color)
  - Channel analytics with views, subscribers, and video metrics
  - User-friendly channel pages with tabs for videos, about, analytics, and settings
  - Loading states and error handling for all channel operations
  - Responsive design for all screen sizes
  - Integration with the existing video system
  - Proper authorization checks for authenticated users

- Implemented reactions system with:
  - Backend API for creating, retrieving, and updating reactions
  - Database schema with unique constraint on userId and videoId
  - Frontend components for displaying and interacting with reactions
  - Support for like/dislike functionality
  - Reaction counts and user reaction tracking
  - User-friendly reaction UI with visual feedback
  - Loading states and error handling for all reaction operations
  - Responsive design for all screen sizes
  - Integration with the video detail page
  - Optimistic updates for better user experience
  - Proper authorization checks for authenticated users

- Need to implement proper testing for all new features
- Need to add proper documentation for all new features
- Need to implement proper security measures for all new features
- Need to add proper logging system for all new features
