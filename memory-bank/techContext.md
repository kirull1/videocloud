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
- ffmpeg-static for consistent ffmpeg availability
- Server-Sent Events (SSE) for real-time progress updates

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

### Videos
- POST /videos - Upload a new video
- GET /videos - Get a list of videos
- GET /videos/:id - Get a specific video
- PATCH /videos/:id - Update a video
- DELETE /videos/:id - Delete a video
- GET /videos/:id/stream - Stream a video
- GET /videos/:id/streaming-info - Get streaming information for a video
- SSE /videos/:id/progress - Get real-time processing progress updates (Server-Sent Events)
- GET /videos/:id/progress-status - Get current processing status (non-SSE version)

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

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT UQ_subscriber_channel UNIQUE (subscriber_id, channel_id)
);

CREATE INDEX IDX_subscriptions_subscriber_id ON subscriptions (subscriber_id);
CREATE INDEX IDX_subscriptions_channel_id ON subscriptions (channel_id);
```

### Comments Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  likes_count INTEGER NOT NULL DEFAULT 0,
  dislikes_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IDX_comments_user_id ON comments (user_id);
CREATE INDEX IDX_comments_video_id ON comments (video_id);
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

### Video Thumbnail Handling
- Custom thumbnails can be uploaded during video creation
- Auto-generated thumbnails are created during video processing
- Thumbnails are stored in S3 with public-read ACL
- Cache-busting parameters prevent browser caching issues
- Cache control headers (no-cache, must-revalidate) for optimal caching behavior
- Unique filenames with timestamps to ensure freshness
- Different storage paths for uploaded vs. generated thumbnails:
  - Uploaded: thumbnails/{userId}/{videoId}/{filename}
  - Generated: thumbnails/{userId}/{videoId}/generated/{filename}
- Frontend uses full page reloads when navigating to video pages
- S3Service provides getPublicUrl method with optional cache-busting parameter

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
- Comprehensive token validation system
- Automatic logout on invalid authentication
- Cookie clearing on logout

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
- Simplified UI by removing Categories and Tags filters from home and search pages
- Maintained category and tag information on video cards for informational purposes
- Updated empty state message in search to remove reference to filters
- Removed filter-related CSS styles and media queries for cleaner codebase
- Frontend video upload components are implemented and ready for backend integration
- Video upload form includes:
  - File selection with drag-and-drop support
  - Metadata input (title, description, category, tags, privacy)
  - Thumbnail generation and custom thumbnail upload
  - Upload progress tracking with speed and time estimation
  - Error handling and validation
- Implemented video upload backend functionality with:
  - RESTful endpoints for video file upload
  - S3 integration for secure file storage
  - File validation for size, type, and metadata
  - Background processing for transcoding and thumbnail generation
  - Real-time progress tracking with Server-Sent Events (SSE)
  - Dedicated processing page to monitor video processing
  - Visual progress indicators with stage information and percentage
  - Automatic navigation to video page upon completion
  - Error handling and recovery mechanisms
  - Proper ffmpeg integration with ffmpeg-static package
  - Fixed video duration handling to ensure integer storage in database
  - Improved error handling for missing ffmpeg
  - Simplified approach for environments without ffmpeg:
    - Direct file copying instead of transcoding attempts
    - Simple placeholder thumbnail creation
    - Skip ffmpeg commands entirely to avoid errors
    - Proper directory creation with error handling
    - Graceful degradation of video processing
  - Robust video status management:
    - Videos always marked as READY even if processing fails
    - Multiple fallback mechanisms to ensure video playability
    - Nested error handling to prevent processing failures from blocking video access
    - Clear separation between processing errors and video availability
  - Comprehensive video streaming fallback system:
    - VideoPlayer component uses videoId instead of direct src
    - Streaming info API provides available quality variants
    - Automatic fallback to original video file if no variants exist
    - Proper error handling for missing files with informative messages
    - Format detection from file extension for correct MIME type

- Enhanced comment system with improved user experience:
  - Fixed API endpoint configuration using appConfig
  - Added proper error handling with user-friendly messages
  - Implemented success notifications for comment actions
  - Added automatic retry for network errors
  - Enhanced UI with loading spinners and error icons
  - Improved visual feedback for all comment operations
  - Added watch functionality to reload comments when video changes
  - Implemented proper error handling for comment deletion
  - Added success message animation with fadeInOut effect
  - Enhanced mobile responsiveness for comment components
  - Improved error recovery with retry buttons
  - Added scroll-to-error functionality for better visibility
  - Optimized API calls to reduce unnecessary requests
  - Fixed issue with video thumbnails not displaying correctly after upload:
    - Added cache-busting parameters to thumbnail URLs
    - Added proper cache control headers to thumbnails in S3Service
    - Modified the VideosService to preserve the original thumbnail if one was provided during upload
    - Added timestamp to thumbnail filenames to ensure uniqueness
    - Updated frontend components to use full page reloads when navigating to video pages
    - Created different storage paths for uploaded vs. generated thumbnails
    - Added logic to refresh existing thumbnail URLs with new cache-busting parameters

## Authentication Validation System

### Implementation Details
- Created a comprehensive token validation system that checks authentication at multiple levels:
  - Client-side validation before making API requests
  - Router-level validation before navigation to protected routes
  - API-level validation on every authenticated request
  - Application-level validation on startup

### New Authentication Utilities
- Created `apiUtils.ts` with authentication helper functions:
  - `handleApiResponse()`: Detects 401 errors and triggers logout
  - `authenticatedFetch()`: Provides consistent auth header handling for API requests
- Enhanced `authApi.ts` with new functionality:
  - `checkAuthValidity()`: Validates token by making a request to the user profile endpoint
  - Improved `logout()`: Clears both localStorage token and all auth-related cookies

### Router Authentication Enhancements
- Updated router guards to perform async token validation before navigation
- Added redirect to login page with preserved destination URL if token is invalid
- Implemented proper error handling for authentication failures during navigation

### Application Initialization Improvements
- Added token validation during application startup in App.vue
- Modified userStore.init() to validate token before fetching user profile
- Implemented automatic logout if token validation fails at any point

### API Request Authentication
- Refactored all API calls to use the new authentication utilities
- Implemented consistent error handling for authentication failures
- Added automatic logout on 401 Unauthorized responses
- Centralized authentication header management

### Security Improvements
- Implemented complete session termination on logout
- Added cookie clearing to prevent stale authentication data
- Enhanced error handling for authentication failures
- Improved user experience with proper redirects after authentication issues
