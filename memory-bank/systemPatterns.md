# VideoCloud System Patterns

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
