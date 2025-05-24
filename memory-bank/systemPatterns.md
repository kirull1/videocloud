# VideoCloud System Patterns

## Architecture Overview

### Frontend Architecture
- Vue 3 with Composition API
- Feature-Sliced Design methodology
- Component-based architecture
- Responsive design implementation
- CSS modules for styling

### Backend Architecture
- NestJS framework
- TypeORM for database operations
- JWT-based authentication
- RESTful API design
- Modular architecture

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

## Authentication System

### JWT Implementation
- Stateless authentication using JWT
- Secure password hashing with bcrypt
- Token-based session management
- Protected route implementation

### User Validation
- Email format validation
- Password strength requirements
- Username uniqueness check
- Input sanitization

## Avatar System

### Implementation
- DiceBear API integration for generated avatars
- Custom avatar upload support with S3 storage
- Fallback mechanism for missing avatars
- Consistent avatar generation across the platform
- Memory storage for file uploads (not disk storage)

### Avatar Generation
```typescript
export const generateAvatarUrl = (username: string, size = 32): string => {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}&size=${size}`;
};
```

### Avatar Upload
```typescript
// Backend: S3Service
async uploadAvatar(file: UploadedFile, userId: string): Promise<string> {
  const uniqueFilename = this.generateUniqueFilename(file.originalname);
  const key = `${this.avatarFolder}${userId}/${uniqueFilename}`;

  try {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Make avatars publicly accessible
        ACL: 'public-read',
      }),
    );

    this.logger.log(`Avatar uploaded successfully: ${key}`);
    return key;
  } catch (error) {
    const s3Error = error as S3Error;
    this.logger.error(`Failed to upload avatar: ${s3Error.message}`, s3Error.stack);
    throw new Error(`Failed to upload avatar: ${s3Error.message}`);
  }
}

// Frontend: userApi
async uploadAvatar(file: File): Promise<AvatarResponse> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  // Create a new FormData instance
  const formData = new FormData();
  
  // Append the file with its original name
  formData.append('avatar', file, file.name);
  
  // Make the request with the correct headers
  // Important: Do NOT set Content-Type header when using FormData
  const response = await fetch(`${API_URL}/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Let the browser set the Content-Type header with boundary
    },
    body: formData,
  });

  // Handle response...
}
```

### File Upload Handling
- Use memory storage for file uploads in NestJS
- Properly configure FileInterceptor without disk storage
- Validate file buffer exists and is not empty
- Use FormData for file uploads in frontend
- Don't set Content-Type header when using FormData
- Append file with original name to FormData

## Frontend Components

### Auth Component
- Responsive design
- User menu with dropdown
- Avatar display
- Authentication state management

### User Menu
- Profile link
- Settings link
- Logout functionality
- Avatar display

## State Management

### Authentication State
- User session management
- Token storage and refresh
- Authentication status tracking
- Error handling

## Error Handling

### Frontend
- Form validation errors
- API error handling
- User feedback
- Loading states

### Backend
- Input validation
- Database error handling
- Authentication errors
- API error responses

## Security Measures

### Authentication
- Secure password hashing
- JWT token validation
- Protected routes
- Input sanitization
- Comprehensive token validation system
- Automatic logout on invalid authentication
- Cookie clearing on logout

### Data Protection
- Environment variables
- Secure headers
- CORS configuration
- Rate limiting

## Testing Strategy

### Frontend Testing
- Component unit tests
- Integration tests
- E2E tests
- Visual regression tests

### Backend Testing
- Unit tests
- Integration tests
- API tests
- Database tests

## Development Workflow

### Code Organization
- Feature-based structure
- Shared components
- Utility functions
- Type definitions

### Version Control
- Git workflow
- Branch strategy
- Commit conventions
- Code review process

## Deployment Strategy

### Frontend
- Static file hosting
- CDN integration
- Build optimization
- Environment configuration

### Backend
- Container deployment
- Database migrations
- Environment setup
- Monitoring setup

## Monitoring and Logging

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

## System Architecture

VideoCloud follows a modern, microservices-oriented architecture that separates concerns while maintaining cohesive functionality. The system is designed with scalability, maintainability, and performance as key architectural drivers.

### High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Client Layer   │────▶│   API Layer     │────▶│  Service Layer  │
│  (Vue.js)       │     │  (NestJS)       │     │                 │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   CDN Layer     │◀────│  Storage Layer  │◀────│  Database Layer │
│                 │     │                 │     │  (PostgreSQL)   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Component Breakdown

1. **Client Layer**

   - Vue.js frontend application
   - Responsive UI components
   - State management with MobX
   - Client-side routing

2. **API Layer**

   - NestJS RESTful API
   - Authentication and authorization
   - Request validation
   - Rate limiting and security

3. **Service Layer**

   - Business logic implementation
   - Video processing services
   - Notification services
   - Analytics processing

4. **Database Layer**

   - PostgreSQL relational database
   - TypeORM for object-relational mapping
   - Data migrations and versioning
   - Query optimization

5. **Storage Layer**

   - Video file storage
   - Thumbnail and preview storage
   - Metadata caching
   - Content delivery preparation

6. **CDN Layer**
   - Global content distribution
   - Edge caching
   - Adaptive streaming delivery
   - Geographic routing

7. **Missing Content Layer**
   - Static 404 page generator
   - Consistent error page styling
   - Fallback for non-existent content
   - Integration with web servers and CDNs

## Key Technical Decisions

### Frontend Framework: Vue.js with Nuxt

**Decision**: Use Vue.js with Nuxt for the frontend application.

**Rationale**:

- Vue.js provides a progressive framework that's easy to learn and use
- Nuxt adds server-side rendering capabilities for improved SEO and performance
- Component-based architecture promotes reusability and maintainability
- Strong ecosystem with well-maintained libraries and tools

### Backend Framework: NestJS

**Decision**: Use NestJS for the backend API and services.

**Rationale**:

- TypeScript-first approach aligns with our type safety goals
- Modular architecture with dependency injection
- Built-in support for OpenAPI documentation
- Scalable and maintainable structure for complex applications

### Database: PostgreSQL

**Decision**: Use PostgreSQL as the primary database.

**Rationale**:

- Robust relational database with strong ACID compliance
- Advanced features like JSON storage for flexible schemas
- Excellent performance for complex queries
- Strong community support and enterprise reliability

### State Management: MobX

**Decision**: Use MobX for frontend state management.

**Rationale**:

- Simpler learning curve compared to alternatives
- Reactive programming model that integrates well with Vue
- Efficient rendering through granular updates
- Good developer experience with clear debugging

### API Design: RESTful with OpenAPI

**Decision**: Implement a RESTful API documented with OpenAPI.

**Rationale**:

- Familiar paradigm for frontend developers
- Clear resource-oriented structure
- Self-documenting with OpenAPI/Swagger
- Cacheable responses for improved performance

### Video Processing: Dedicated Service

**Decision**: Implement video processing as a separate service.

**Rationale**:

- Resource-intensive tasks isolated from main application
- Independently scalable based on processing demands
- Specialized optimization for video transcoding
- Failure isolation for system stability

### File Upload: Memory Storage

**Decision**: Use memory storage for file uploads instead of disk storage.

**Rationale**:

- Simplifies file handling in serverless environments
- Avoids file system permissions issues
- Allows direct streaming to cloud storage
- Reduces disk I/O operations
- Prevents issues with temporary file cleanup

## Design Patterns in Use

### Frontend Patterns

1. **Feature-Sliced Design (FSD)**

   - Architecture methodology that organizes code by business domain and technical purpose
   - Layered structure: app → pages → widgets → features → entities → shared
   - Clear boundaries between layers with unidirectional dependencies
   - Improved maintainability and scalability

2. **Color System**

   - Light and dark theme support via CSS variables
   - Primary palette:
     - `--video-bg`: Main background (#F7FAFD / #161B23)
     - `--panel-bg`: Panel/card background (#E6F0FB / #232C3A)
     - `--primary`: Primary brand color (#41A4FF / #43ADEB)
     - `--secondary`: Secondary brand color (#9067E6 / #A993FF)
     - `--hover-bg`: Hover state background (#EAF9F7 / #223144)
     - `--text-primary`: Primary text color (#1A2233 / #F8FBFF)
     - `--text-secondary`: Secondary text color (#67748B / #A1B1C9)
     - `--success`: Success state (#8FF6E9 / #5CF6DF)
     - `--error`: Error state (#FF677B / #FF748E)
   - Video-specific colors:
     - `--player-bg`: Video player background
     - `--player-controls`: Player controls
     - `--progress-bar`: Video progress bar
     - `--buffer-bar`: Buffer indicator
     - `--shadow`: Shadow for cards and elements
     - `--overlay`: Overlay for modals and dialogs

3. **Component Pattern**

   - Reusable UI components with clear interfaces
   - Composition over inheritance
   - Slot-based content distribution
   - Prop validation and typing
   - Standard component structure:
     - ComponentName.vue (component code)
     - index.ts (re-export)
     - ComponentName.stories.ts (Storybook documentation)
     - ComponentName.spec.ts (Playwright screenshot tests)
     - ComponentName.test.ts (Unit tests with Vitest)
     - __screenshots__/ (Screenshot reference directory)
     - NOTE: Do NOT create README.md files for components
   
   - Component Development Workflow:
     1. Create the component (ComponentName.vue) and its re-export (index.ts)
     2. Create Storybook stories (ComponentName.stories.ts) to document and visualize all component variants
     3. Create screenshot tests (ComponentName.spec.ts) for both mobile and desktop viewports
     4. Create unit tests (ComponentName.test.ts) to verify component functionality
     5. This sequence is mandatory for all new components

4. **Container/Presenter Pattern**

   - Separation of data fetching from presentation
   - Smart containers connected to state
   - Dumb presenters focused on rendering
   - Improved testability and reusability

5. **Observer Pattern (via MobX)**

   - Observable state
   - Automatic tracking of dependencies
   - Reactive updates to the UI
   - Decoupled state from components

6. **Module Pattern**
   - Encapsulated functionality
   - Clear public interfaces
   - Private implementation details
   - Reduced global namespace pollution

### Backend Patterns

1. **Dependency Injection**

   - Inversion of control
   - Testable service implementations
   - Configurable dependencies
   - Reduced coupling between modules

2. **Repository Pattern**

   - Abstraction over data access
   - Centralized query logic
   - Swappable data sources
   - Domain-focused interfaces

3. **Decorator Pattern**

   - Metadata annotations for routes and controllers
   - Cross-cutting concerns like validation and logging
   - Aspect-oriented programming approach
   - Clean separation of business logic

4. **Middleware Pattern**

   - Request/response pipeline
   - Composable request processing
   - Authentication and authorization layers
   - Logging and monitoring integration

5. **Command Query Responsibility Segregation (CQRS)**
   - Separation of read and write operations
   - Optimized query models
   - Scalable command processing
   - Event-driven state updates

## Component Relationships

### Frontend Component Hierarchy

```
App
├── Layout
│   ├── Header
│   │   ├── Navigation
│   │   ├── SearchBar
│   │   └── UserMenu
│   ├── Sidebar
│   └── Footer
├── Pages
│   ├── Home
│   ├── VideoPlayer
│   ├── ChannelPage
│   ├── SearchResults
│   └── UserDashboard
└── Common
    ├── VideoCard
    ├── CommentSection
    ├── Pagination
    ├── Notifications
    └── Text
```

### Backend Module Structure

```
AppModule
├── AuthModule
│   ├── AuthController
│   ├── AuthService
│   └── JwtStrategy
├── UserModule
│   ├── UserController
│   ├── UserService
│   └── UserRepository
├── VideoModule
│   ├── VideoController
│   ├── VideoService
│   └── VideoRepository
├── CommentModule
│   ├── CommentController
│   ├── CommentService
│   └── CommentRepository
└── ProcessingModule
    ├── ProcessingController
    ├── ProcessingService
    └── ProcessingQueue
```

### Data Flow Patterns

1. **User Authentication Flow**

   - Client submits credentials
   - AuthService validates and issues JWT
   - Token stored in client
   - Subsequent requests include token
   - JwtStrategy validates token on protected routes

2. **Video Upload Flow**

   - Client uploads video file
   - API accepts and validates upload
   - ProcessingService transcodes video
   - Storage service stores video files
   - Database updated with video metadata
   - CDN notified of new content

3. **Video Playback Flow**

   - Client requests video
   - API validates access permissions
   - CDN serves optimized video stream
   - Analytics service records view
   - Recommendations updated based on view

4. **Comment Interaction Flow**
   - User submits comment
   - API validates and stores comment
   - Notification sent to video owner
   - Comment feed updated in real-time
   - Moderation queue updated if needed

5. **Avatar Upload Flow**
   - User selects avatar image
   - Frontend validates file type and size
   - FormData created with file
   - API receives file via FileInterceptor
   - File stored in memory (not on disk)
   - S3Service uploads file to S3 bucket
   - Public URL generated and stored in user profile
   - Frontend displays new avatar

6. **Avatar Retrieval Flow**
   - Frontend requests avatar via `/api/users/:id/avatar` endpoint
   - Backend checks if user has a custom avatar URL
   - If custom avatar exists, redirect to the S3 URL
   - If no custom avatar, generate default avatar URL using DiceBear API
   - Frontend displays the avatar consistently across the application

## Video Components

### VideoCard Component
- Displays video previews in lists and grids
- Shows video thumbnail with duration overlay in MM:SS format
- Displays video title, channel name, views, and upload date
- Includes channel avatar using the avatar endpoint
- Supports visual indicators for new and watched videos
- Implements responsive design for different screen sizes
- Formats duration from seconds to MM:SS format
- Handles null/undefined duration values gracefully
- Formats view counts with K/M suffixes for large numbers
- Calculates relative time for upload dates (e.g., "2 days ago")

### Video Upload Component
- Provides drag-and-drop interface for video file selection
- Validates file size and type before upload
- Extracts video metadata including duration
- Uses HTML5 video element to calculate video duration
- Shows calculated duration in the upload form with clock icon
- Provides visual feedback during duration calculation with loading indicator
- Supports category selection and tagging
- Allows setting video visibility (public/private)
- Shows upload progress with percentage indicator
- Sends video duration to backend as part of upload metadata

### Video Duration Calculation
- Implements a multi-layer approach for video duration calculation:
  - Client-side: Uses HTML5 video element for immediate user feedback
  - Server-side: Uses `fluent-ffmpeg` with `@ffprobe-installer/ffprobe` for reliable duration extraction
- Server calculates duration if not provided by the client
- Handles various video formats (MP4, WebM, OGG, QuickTime)
- Provides graceful fallback if any calculation method fails
- Stores duration in seconds in the database
- Formats duration as MM:SS for display in the UI
- Uses a custom temporary directory within the project for file operations
- Implements proper file permissions handling to avoid EACCES errors:
  - Sets appropriate file permissions (0o666) on temporary video files
  - Sets execute permission (0o755) on the ffprobe executable
- Adds robust error handling and detailed logging
- Ensures cleanup of temporary files after processing

### Comments System
- Comprehensive comment management:
  - Comments can be created, read, updated, and deleted
  - Support for nested replies with proper threading
  - Comments are associated with videos and users
  - Authorization checks ensure users can only edit/delete their own comments
- Database design:
  - Self-referencing relationship for nested comments
  - Foreign keys to videos and users with cascade deletion
  - Counters for likes, dislikes, and replies
  - Timestamps for creation and updates
- User interface components:
  - CommentItem component for displaying individual comments
  - CommentForm component for creating and editing comments
  - CommentSection component for organizing the entire comments section
  - Responsive design with proper spacing and typography
- State management:
  - Centralized comment store for managing comment data
  - Optimistic updates for better user experience
  - Proper error handling and loading states
  - Support for pagination and lazy loading of replies

### User Channel Pages System
- Comprehensive channel management:
  - Users can create and customize their own channels
  - Each user can have only one channel
  - Channels have customizable properties (name, description, custom URL, theme color)
  - Channels display user's videos and analytics
  - Channels have different tabs for videos, about, analytics, and settings
- Database design:
  - One-to-one relationship between users and channels
  - Foreign keys to users with cascade deletion
  - Unique constraint on customUrl to prevent duplicates
  - Counter fields for totalViews, subscriberCount, and videoCount for efficient display
  - Timestamps for creation and updates
- User interface components:
  - Channel detail page with tabs for different sections
  - Channel list page for browsing channels
  - Channel creation page with form validation
  - Channel analytics with charts and metrics
  - Responsive design with proper spacing and styling
- State management:
  - Centralized channel store for managing channel data
  - Proper error handling and loading states
  - Efficient caching of channel data
  - Support for optimistic updates

### Reactions System
- Comprehensive reaction management:
  - Users can like or dislike videos
  - Each user can have only one reaction per video
  - Users can change their reaction or remove it
  - Reactions are tracked and aggregated for each video
  - Authorization checks ensure users are authenticated to react
- Database design:
  - Unique constraint on userId and videoId to prevent duplicate reactions
  - Foreign keys to videos and users with cascade deletion
  - Enum type for reaction types (like/dislike)
  - Timestamps for creation and updates
  - Counter fields in videos table for efficient aggregation
- User interface components:
  - ReactionButtons component for displaying and interacting with reactions
  - Visual feedback for active reactions
  - Real-time updates of reaction counts
  - Responsive design with proper spacing and styling
- State management:
  - Centralized reaction store for managing reaction data
  - Optimistic updates for better user experience
  - Proper error handling and loading states
  - Efficient caching of video reactions

### Advanced Search System
- Comprehensive search functionality:
  - Full-text search across video titles and descriptions
  - Search query parameter support in the URL
  - Real-time search results with loading states
  - Empty state handling with helpful suggestions
- Advanced filtering capabilities:
  - Combined search with category and tag filters
  - Filter UI with active state indicators
  - Responsive filter design with horizontal scrolling on mobile
- Search integration:
  - Global search bar in the header across all pages
  - Dedicated search results page
  - Integration with existing video grid components
  - Consistent styling with the rest of the application
- Technical implementation:
  - Backend search endpoint with query parameters
  - Frontend search page with filter state management
  - Router integration for shareable search URLs
  - Reactive UI updates based on search and filter changes

### Content Organization System
- Comprehensive category and tag management:
  - Categories provide primary classification for videos
  - Tags allow for more granular and cross-cutting organization
  - Both categories and tags have human-readable names and URL-friendly slugs
- Video organization features:
  - Each video can belong to one category
  - Videos can have multiple tags
  - Categories and tags are displayed on video cards and detail pages
  - Users can filter videos by category or tag
- User interface components:
  - Category badges with distinctive styling
  - Tag chips with hashtag prefix
  - Filter UI with active state indicators
  - Responsive design with horizontal scrolling on mobile
- Database relationships:
  - One-to-many relationship between categories and videos
  - Many-to-many relationship between tags and videos
  - Usage count tracking for tags
  - Ordering capability for categories

### Video Processing Pipeline
- Comprehensive video processing service that handles:
  - Transcoding videos to different formats (MP4, WebM)
  - Creating different quality variants (720p, 480p, 360p)
  - Generating thumbnails at strategic points in the video
  - Updating video status as it progresses through the pipeline
- Background processing triggered after initial upload
- Uses fluent-ffmpeg for reliable video processing
- Implements proper error handling and logging
- Processes videos asynchronously to avoid blocking the main thread
- Updates video entity with processed information
- Generates multiple thumbnails and selects the best one
- Creates adaptive streaming variants for different network conditions
- Handles cleanup of temporary files after processing

### Advanced Video Player
- Custom-built video player with enhanced functionality:
  - Custom playback controls with modern UI
  - Progress bar with seek functionality
  - Volume control with mute toggle
  - Playback speed adjustment (0.25x to 2x)
  - Fullscreen mode with proper scaling
  - Picture-in-Picture support
  - Keyboard shortcuts for all controls
  - Auto-hiding controls during playback
  - Responsive design for all screen sizes
- Accessibility features:
  - Keyboard navigation
  - Screen reader support
  - High contrast UI elements
- User experience enhancements:
  - Visual feedback for all interactions
  - Smooth transitions and animations
  - Consistent styling with the application theme
  - Tooltips for controls
  - Time display in MM:SS format

### Adaptive Video Streaming
- VideoPlayerService in the backend provides streaming information
- Dedicated endpoint for retrieving streaming options
- Support for multiple formats (MP4, HLS, DASH)
- Quality selection (720p, 480p, 360p)
- Enhanced VideoPlayer component with:
  - Quality selector UI
  - Format selection
  - Adaptive playback based on network conditions
  - Loading states and error handling
- Client-side quality switching without interrupting playback
- Remembers user's quality preferences
- Fallback to direct video URL if streaming info is unavailable

### Video Upload Flow
- User selects video file via drag-and-drop or file browser
- Frontend calculates video duration using HTML5 video element
- Duration is stored in upload metadata
- Video is uploaded to backend with duration included in FormData
- Backend CreateVideoDto accepts duration parameter
- Duration is stored in the database with the video
- Video cards display the actual duration of videos
- After upload, video processing pipeline is triggered in the background
- Video status is updated as processing progresses

## Communication Patterns

1. **REST API Communication**

   - HTTP/HTTPS protocol
   - JSON payload format
   - Resource-oriented endpoints
   - Standard HTTP methods and status codes

2. **Real-time Updates**

   - WebSocket connections for live data
   - Event-based notifications
   - Pub/sub pattern for distribution
   - Client-side state synchronization

3. **Service-to-Service Communication**

   - Internal API calls
   - Message queues for asynchronous processing
   - Event-driven architecture for decoupling
   - Circuit breakers for failure handling

4. **Database Interaction**
   - TypeORM repositories
   - Prepared statements
   - Transaction management
   - Connection pooling

## Scalability Patterns

1. **Horizontal Scaling**

   - Stateless API servers
   - Load balancing across instances
   - Session management via Redis
   - Database read replicas

2. **Caching Strategy**

   - CDN for static assets and videos
   - Redis for application caching
   - Browser caching with appropriate headers
   - Query result caching

3. **Database Scaling**

   - Vertical scaling for primary database
   - Read replicas for query distribution
   - Connection pooling
   - Query optimization and indexing

4. **Processing Scalability**
   - Worker pools for video processing
   - Queue-based task distribution
   - Auto-scaling based on queue depth
   - Resource allocation based on video complexity

## Authentication Validation System

### Token Validation Implementation
- Multi-layer token validation approach:
 - Client-side validation before making API requests
 - Router-level validation before navigation to protected routes
 - API-level validation on every authenticated request
 - Application-level validation on startup
- Comprehensive token validation flow:
 1. Token existence check (is token present in localStorage)
 2. Token validity check (is token properly formatted)
 3. Token authentication check (is token accepted by the backend)
 4. Automatic logout on any validation failure

### Authentication API Utilities
- `checkAuthValidity()` function in authApi:
 - Makes a request to the user profile endpoint to validate token
 - Returns boolean indicating if token is valid
 - Automatically logs out user if token is invalid
- Enhanced `logout()` function:
 - Removes token from localStorage
 - Clears all authentication-related cookies
 - Redirects to login page
 - Ensures complete session termination

### API Request Authentication
- `apiUtils.ts` utility with authentication helpers:
 - `handleApiResponse()` function to detect 401 errors and trigger logout
 - `authenticatedFetch()` function for consistent auth header handling
 - Centralized error handling for authentication failures
 - Automatic token validation on all API requests

### Router Authentication Guards
- Enhanced router guards with token validation:
 - Async validation before navigation to protected routes
 - Redirects to login page if token is invalid
 - Preserves intended destination for post-login redirect
 - Prevents access to protected routes with invalid tokens

### Application Initialization
- Token validation during application startup:
 - Validates token when App component is mounted
 - Initializes user store only if token is valid
 - Provides immediate feedback on authentication status
 - Ensures consistent authentication state across the application
