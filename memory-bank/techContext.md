# VideoCloud Technical Context

## Technologies Used

### Frontend Technologies

| Technology | Version | Purpose                        |
| ---------- | ------- | ------------------------------ |
| Vue.js     | 3.x     | Core UI framework              |
| Nuxt.js    | 3.x     | Vue meta-framework for SSR/SSG |
| TypeScript | 5.x     | Type-safe JavaScript           |
| MobX       | 6.x     | State management               |
| SCSS       | -       | Enhanced styling               |
| Vite       | 4.x     | Build tool and dev server      |
| Vitest     | -       | Unit testing framework         |
| Playwright | -       | End-to-end testing             |
| ESLint     | -       | Code linting                   |
| Prettier   | -       | Code formatting                |

### Backend Technologies

| Technology      | Version | Purpose                       |
| --------------- | ------- | ----------------------------- |
| NestJS          | 10.x    | Backend framework             |
| TypeScript      | 5.x     | Type-safe JavaScript          |
| TypeORM         | 0.3.x   | ORM for database interactions |
| PostgreSQL      | 15.x    | Relational database           |
| Jest            | 29.x    | Testing framework             |
| Swagger/OpenAPI | 3.0     | API documentation             |
| Passport        | -       | Authentication                |
| JWT             | -       | Token-based auth              |
| pnpm            | 10.8.1  | Package manager               |
| Node.js         | 22.14.0 | JavaScript runtime            |

### Infrastructure & DevOps

| Technology     | Purpose                     |
| -------------- | --------------------------- |
| Docker         | Containerization            |
| GitHub Actions | CI/CD pipeline              |
| AWS S3         | Video storage               |
| AWS CloudFront | CDN for video delivery      |
| AWS RDS        | Managed PostgreSQL          |
| Redis          | Caching and session storage |
| Prometheus     | Monitoring                  |
| Grafana        | Metrics visualization       |
| ELK Stack      | Logging and analysis        |

### Video Processing

| Technology              | Purpose                              |
| ----------------------- | ------------------------------------ |
| FFmpeg                  | Video transcoding                    |
| HLS                     | HTTP Live Streaming                  |
| DASH                    | Dynamic Adaptive Streaming over HTTP |
| WebRTC                  | Real-time communication              |
| Media Source Extensions | Adaptive streaming in browser        |

## Development Setup

### Prerequisites

- **Node.js**: Version 22.14.0
- **pnpm**: Version 7.33.6
- **PostgreSQL**: Version 15.x
- **Docker**: Latest version (for containerized development)
- **Git**: Latest version
- **IDE**: VSCode recommended with extensions:
  - Vue Language Features (Volar)
  - TypeScript Vue Plugin (Volar)
  - ESLint
  - Prettier
  - GitLens
  - REST Client

### Node.js and pnpm Setup

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc  # or ~/.zshrc for macOS

# Use correct Node.js version (from .nvmrc file with version 22.14.0)
nvm use

# Install pnpm
npm install -g pnpm@10.8.1
```

### Platform-Specific Docker Setup

#### macOS

For macOS, especially on Apple Silicon (ARM) machines, we recommend using Colima instead of Docker Desktop:

- **Colima**: Provides a container runtime for macOS
  - Install via Homebrew: `brew install colima docker docker-compose`
  - For Intel Macs: `colima start`
  - For Apple Silicon (ARM) Macs: `colima start --arch aarch64 --vm-type=vz --vz-rosetta --cpu 6 --memory 8`

#### Linux

- **Docker and Docker Compose**: Install via package manager
  - Ubuntu/Debian: `sudo apt install docker.io docker-compose`
  - Enable service: `sudo systemctl enable --now docker`
  - Add user to docker group: `sudo usermod -aG docker $USER`

### Frontend Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/kirull1/videocloud.git
   cd videocloud/frontend
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Start development server**:

   ```bash
   pnpm run dev
   ```

4. **Run tests**:

   ```bash
   # Unit tests
   pnpm run test

   # E2E tests
   pnpm run test:e2e

   # Coverage
   pnpm run test:coverage
   ```

5. **Build for production**:
   ```bash
   pnpm run build
   ```

### Backend Setup

1. **Navigate to backend directory**:

   ```bash
   cd videocloud/backend
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Configure environment**:
   Create a `.env` file with the following variables:

   ```
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=postgres
   DATABASE_NAME=videocloud
   JWT_SECRET=your-secret-key
   ```

4. **Run database migrations**:

   ```bash
   pnpm run typeorm migration:run
   ```

5. **Start development server**:

   ```bash
   pnpm run start:dev
   ```

6. **Run tests**:

   ```bash
   # Unit tests
   pnpm run test

   # E2E tests
   pnpm run test:e2e

   # Coverage
   pnpm run test:cov
   ```

### Docker Setup (Optional)

1. **Build and run with Docker Compose**:

   ```bash
   docker-compose up -d
   ```

2. **Access services**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

## Technical Constraints

### Performance Requirements

- **Video Playback**: Buffer-free playback on connections as low as 1.5 Mbps
- **Page Load**: Initial page load under 2 seconds (95th percentile)
- **API Response**: 95% of API requests complete under 200ms
- **Transcoding**: Support for processing at least 100 hours of video per day
- **Concurrent Users**: Support for at least 10,000 concurrent users

### Scalability Requirements

- **Storage**: Efficiently handle petabytes of video data
- **Traffic**: Support for millions of video views per day
- **Users**: Scale to millions of registered users
- **Global Access**: Content delivery optimized for global audience

### Security Requirements

- **Authentication**: Secure user authentication with JWT
- **Authorization**: Role-based access control
- **Content Protection**: DRM for premium content
- **Data Protection**: Encryption for sensitive user data
- **API Security**: Rate limiting, CORS, and input validation

### Compliance Requirements

- **GDPR**: Compliance with European data protection regulations
- **CCPA**: Compliance with California Consumer Privacy Act
- **Accessibility**: WCAG 2.1 AA compliance
- **Content Moderation**: Tools for flagging inappropriate content

### Browser Support

- **Desktop**:
  - Chrome (last 2 versions)
  - Firefox (last 2 versions)
  - Safari (last 2 versions)
  - Edge (last 2 versions)
- **Mobile**:
  - iOS Safari (last 2 versions)
  - Android Chrome (last 2 versions)

## Dependencies

### Frontend Dependencies

Key dependencies for the frontend include:

- **@nuxt/ui**: UI component library for Nuxt
- **@vueuse/core**: Collection of Vue composition utilities
- **mobx**: State management library
- **mobx-vue-lite**: MobX bindings for Vue
- **axios**: HTTP client for API requests
- **vue-router**: Routing library (included in Nuxt)
- **video.js**: Video player framework
- **chart.js**: Charting library for analytics
- **date-fns**: Date utility library
- **lodash-es**: Utility library
- **zod**: Schema validation

### Backend Dependencies

Key dependencies for the backend include:

- **@nestjs/core**: Core NestJS framework
- **@nestjs/typeorm**: TypeORM integration for NestJS
- **@nestjs/passport**: Authentication for NestJS
- **@nestjs/swagger**: OpenAPI documentation
- **typeorm**: ORM for database interactions
- **pg**: PostgreSQL client
- **passport**: Authentication middleware
- **passport-jwt**: JWT strategy for Passport
- **class-validator**: Validation library
- **class-transformer**: Object transformation
- **nestjs-redis**: Redis integration
- **winston**: Logging library
- **ffmpeg**: Video processing (via child_process)

### DevOps Dependencies

- **Docker**: Containerization
- **docker-compose**: Multi-container Docker applications
- **GitHub Actions**: CI/CD workflows
- **AWS SDK**: Interaction with AWS services
- **terraform**: Infrastructure as code (for production)

## Development Workflow

1. **Feature Planning**:

   - Requirements gathering
   - Technical specification
   - Task breakdown in issue tracker

2. **Development**:

   - Branch creation from main (`feature/feature-name`)
   - Implementation with TDD approach
   - Self-review and local testing

3. **Code Review**:

   - Pull request creation
   - Automated CI checks
   - Peer code review
   - Addressing feedback

4. **Testing**:

   - Unit tests
   - Integration tests
   - E2E tests
   - Manual QA

5. **Deployment**:

   - Merge to main branch
   - Automated deployment to staging
   - Verification in staging environment
   - Promotion to production

6. **Monitoring**:
   - Performance monitoring
   - Error tracking
   - User feedback collection
   - Iterative improvements

## Environment Configuration

### Development Environment

- Local development setup
- Local PostgreSQL database
- Mock services for third-party integrations
- Hot reloading for rapid development

### Staging Environment

- Cloud-hosted environment
- Isolated database with production-like data
- Integration with test versions of third-party services
- Automated deployments from main branch

### Production Environment

- High-availability cloud setup
- Database clusters with replication
- CDN integration for content delivery
- Auto-scaling based on load
- Regular backups and disaster recovery

## Monitoring and Observability

- **Application Metrics**: Response times, error rates, request counts
- **Business Metrics**: User registrations, video uploads, engagement
- **Infrastructure Metrics**: CPU, memory, disk usage, network
- **Logging**: Centralized logging with structured format
- **Alerting**: Automated alerts for critical issues
- **Dashboards**: Real-time visibility into system health
