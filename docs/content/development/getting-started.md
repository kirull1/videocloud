---
sidebar_position: 1
---

# Getting Started

This guide will help you set up and start developing for VideoCloud.

## Prerequisites

### Required Software
- Node.js 22.14.0 or later
- pnpm 10.8.1 or later
- PostgreSQL 16 or later
- Docker (optional, for containerized development)

### Development Tools
- Git for version control
- VS Code (recommended) or your preferred IDE
- Postman or similar API testing tool
- Docker Desktop (optional)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/videocloud/video-cloud.git
cd video-cloud
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
pnpm install

# Install backend dependencies
cd ../backend
pnpm install
```

### 3. Environment Configuration

Create `.env` files in both frontend and backend directories:

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=VideoCloud
VITE_APP_VERSION=1.0.0
```

#### Backend (.env)
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

### 4. Database Setup

```bash
# Create database
createdb videocloud

# Run migrations
cd backend
pnpm migration:run
```

## Development Workflow

### Starting Development Servers

#### Frontend Development
```bash
cd frontend
pnpm dev
```
The frontend will be available at http://localhost:5173

#### Backend Development
```bash
cd backend
pnpm start:dev
```
The backend API will be available at http://localhost:3000

### Running Tests

#### Frontend Tests
```bash
cd frontend
# Unit tests
pnpm test
# E2E tests
pnpm test:e2e
```

#### Backend Tests
```bash
cd backend
# Unit tests
pnpm test
# Integration tests
pnpm test:e2e
```

## Project Structure

### Frontend Structure
```
frontend/
├── src/
│   ├── features/           # Feature-based modules
│   │   ├── auth/          # Authentication
│   │   ├── videos/        # Video management
│   │   └── users/         # User management
│   ├── shared/            # Shared resources
│   │   ├── lib/          # Utilities
│   │   ├── ui/           # Common components
│   │   └── api/          # API clients
│   └── app/              # App setup
├── public/               # Static assets
└── tests/               # Test files
```

### Backend Structure
```
backend/
├── src/
│   ├── auth/             # Authentication
│   ├── users/            # User management
│   ├── videos/           # Video management
│   ├── config/           # Configuration
│   ├── shared/           # Shared resources
│   └── migrations/       # Database migrations
├── test/                # Test files
└── dist/                # Compiled output
```

## Development Guidelines

### Code Style

We use ESLint and Prettier for code formatting. The configuration is included in the project.

```bash
# Format code
pnpm format

# Lint code
pnpm lint
```

### Git Workflow

1. Create a new branch for your feature/fix
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit
```bash
git add .
git commit -m "feat: your feature description"
```

3. Push your branch
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request

### Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build process or auxiliary tool changes

## API Development

### API Documentation

API documentation is available at:
- Swagger UI: http://localhost:3000/api/docs
- OpenAPI Spec: http://localhost:3000/api-json

### Testing API Endpoints

1. Use the provided Postman collection in `docs/postman/VideoCloud.postman_collection.json`
2. Import the collection into Postman
3. Set up environment variables in Postman
4. Start testing endpoints

## Common Tasks

### Adding a New Feature

1. Create feature directory in `frontend/src/features/`
2. Add necessary components, API integration, and state management
3. Create corresponding backend module in `backend/src/`
4. Add tests for both frontend and backend
5. Update documentation

### Database Changes

1. Create a new migration
```bash
cd backend
pnpm migration:create src/migrations/YourMigrationName
```

2. Implement the migration
3. Run the migration
```bash
pnpm migration:run
```

### Adding New Dependencies

```bash
# Frontend
cd frontend
pnpm add package-name

# Backend
cd backend
pnpm add package-name
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check PostgreSQL is running
   - Verify database credentials
   - Check database exists

2. **S3 Storage Issues**
   - Verify S3 credentials
   - Check bucket permissions
   - Verify network connectivity

3. **Authentication Issues**
   - Check JWT secret
   - Verify token expiration
   - Check CORS settings

### Getting Help

- Check the [FAQ](../faq)
- Search existing issues
- Create a new issue if needed
- Contact the development team

## Next Steps

- Review [API Documentation](/docs/api/api-overview)
- Follow [Contributing Guidelines](../contributing/guidelines)
- Check [Development Workflow](./development-workflow)
- Join the development team on Slack 