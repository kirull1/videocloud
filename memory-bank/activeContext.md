# VideoCloud Active Context

## Current Work Focus

The VideoCloud project is currently in the initial development phase, focusing on establishing the core architecture and foundational components. The primary focus areas are:

1. **Project Structure Setup**

   - Establishing the frontend and backend repositories
   - Setting up the development environment
   - Configuring build tools and linters

2. **Core Authentication System**

   - User registration and login flows
   - JWT-based authentication
   - Role-based authorization

3. **Basic Video Upload Functionality**

   - File upload interface
   - Backend storage integration
   - Initial processing pipeline

4. **Foundational UI Components**
   - Design system implementation
   - Core UI component library
   - Responsive layout framework

## Recent Changes

As this is the project initialization phase, the following foundational elements have been established:

1. **Project Repository Structure**

   - Created separate directories for frontend and backend
   - Initialized Git repository with initial commit
   - Added comprehensive README documentation with running instructions for macOS and Linux
   - Extracted Node.js and pnpm installation instructions into a separate section
   - Added .nvmrc file specifying Node.js version 20.16.0
   - Set up memory bank documentation
   - Moved common configurations to the root level
   - Reorganized frontend structure following Feature-Sliced Design (FSD) methodology
   - Configured path aliases for both frontend and backend to improve code organization
   - Created common .gitignore and .gitattributes files
   - Set up a comprehensive style guide based on Airbnb JavaScript Style Guide

2. **Frontend Setup**

   - Initialized Vue.js project with Nuxt.js
   - Configured TypeScript
   - Set up ESLint and Prettier
   - Added basic routing structure

3. **Backend Setup**

   - Initialized NestJS project
   - Configured TypeScript
   - Set up basic module structure
   - Added initial controller and service

4. **Development Environment**

   - Configured workspace package.json with scripts
   - Set up testing frameworks
   - Added initial CI/CD workflow configuration
   - Created docker-compose.yml for development services

5. **Project Configuration**
   - Established simplified common ESLint configuration
   - Created shared Prettier settings
   - Set up base TypeScript configuration
   - Added unified .gitignore and .gitattributes
   - Created common .editorconfig
   - Configured minimal root dependencies
   - Added required dependencies to frontend and backend packages
   - Set up pnpm workspace with pnpm-workspace.yaml

## Next Steps

The immediate next steps for the project include:

1. **User Authentication Implementation**

   - Create user entity and repository
   - Implement authentication controller and service
   - Set up JWT strategy and guards
   - Develop login and registration UI components

2. **Database Schema Design**

   - Define core entities (User, Video, Channel, Comment)
   - Create initial migrations
   - Set up TypeORM repositories
   - Implement data access services

3. **Video Upload Flow**

   - Design and implement upload UI
   - Create backend endpoints for file upload
   - Set up temporary storage mechanism
   - Implement basic validation

4. **Frontend Routing and Layout**

   - Implement main application layout
   - Set up protected routes
   - Create navigation components
   - Implement responsive design

5. **Testing Infrastructure**
   - Set up unit testing for core components
   - Implement integration tests for API endpoints
   - Create E2E tests for critical user flows
   - Configure test coverage reporting

## Active Decisions and Considerations

### Architecture Decisions

1. **API Design Approach**

   - **Decision Needed**: REST vs GraphQL for the API layer
   - **Considerations**:
     - REST is more familiar and has better tooling support
     - GraphQL offers more flexible data fetching
     - Team experience leans toward REST
     - Future mobile app development might benefit from GraphQL
   - **Current Direction**: Implementing RESTful API with potential to add GraphQL later

2. **State Management Strategy**

   - **Decision**: Using MobX for state management
   - **Rationale**:
     - Simpler learning curve compared to Vuex/Pinia
     - Good TypeScript integration
     - Efficient rendering through granular updates
     - Familiar to team members with React experience

3. **Video Storage Solution**
   - **Decision Needed**: Self-hosted vs Cloud storage
   - **Considerations**:
     - AWS S3 offers scalability and CDN integration
     - Self-hosted solution gives more control
     - Cost implications at scale
     - Compliance requirements
   - **Current Direction**: Starting with AWS S3 for simplicity and scalability

### Technical Considerations

1. **Video Processing Pipeline**

   - **Challenge**: Efficient transcoding of uploaded videos
   - **Options**:
     - Serverless functions for processing
     - Dedicated worker servers
     - Third-party transcoding service
   - **Current Approach**: Investigating serverless approach with AWS Lambda

2. **Real-time Features**

   - **Challenge**: Implementing chat, notifications, and live statistics
   - **Options**:
     - WebSockets
     - Server-Sent Events
     - Long polling
   - **Current Approach**: Planning to use WebSockets via Socket.io

3. **Performance Optimization**
   - **Challenge**: Ensuring fast page loads and video playback
   - **Focus Areas**:
     - Code splitting and lazy loading
     - Efficient asset delivery
     - Adaptive streaming implementation
     - Caching strategy
   - **Current Approach**: Implementing initial optimizations, with plans for performance testing

### Open Questions

1. **Monetization Strategy**

   - How will the platform support monetization for creators?
   - What payment processing system should be integrated?
   - How to handle subscription vs. pay-per-view models?

2. **Content Moderation**

   - What approach to take for content moderation?
   - Should we implement automated screening, manual review, or both?
   - How to handle copyright claims and disputes?

3. **Scalability Planning**
   - At what points will we need to enhance the infrastructure?
   - How to design for horizontal scaling from the beginning?
   - What metrics should trigger scaling decisions?

## Current Blockers

1. **Environment Configuration**

   - Need to finalize the development environment setup
   - Standardize environment variables across environments

2. **Authentication Flow**

   - Need to decide on specific authentication flow details
   - Determine password policy and recovery mechanisms

3. **Video Processing Requirements**
   - Need to define supported formats and quality levels
   - Determine transcoding profiles and storage requirements

## Team Focus

| Team Member   | Current Focus                 | Next Task                     |
| ------------- | ----------------------------- | ----------------------------- |
| Frontend Team | Setting up core UI components | Implement authentication UI   |
| Backend Team  | Establishing API structure    | Implement user authentication |
| DevOps        | CI/CD pipeline configuration  | Set up staging environment    |
| Product       | Defining MVP requirements     | Create detailed user stories  |

## Recent Decisions

| Decision                          | Rationale                                                    | Date       |
| --------------------------------- | ------------------------------------------------------------ | ---------- |
| Use NestJS for backend            | TypeScript support, modular architecture, good documentation | 2025-04-01 |
| Use Vue.js with Nuxt for frontend | SSR capabilities, good TypeScript support, team familiarity  | 2025-04-01 |
| Use pnpm as package manager       | Faster installation, disk space efficiency                   | 2025-04-05 |
| Use Jest for testing              | Good TypeScript support, snapshot testing, wide adoption     | 2025-04-08 |
