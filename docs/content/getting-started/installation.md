---
id: installation
sidebar_position: 1
---

# Installation

This guide will help you get VideoCloud up and running on your system.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v22.14.0 or higher)
- pnpm (v10.8.1 or higher)
- PostgreSQL 16
- Docker and Docker Compose (for containerized deployment, optional)
- Git

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/kirull1/video-cloud.git
cd video-cloud
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

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

# Frontend
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=VideoCloud

# S3 Storage (if using cloud storage)
YANDEX_CLOUD_REGION=ru-central1
YANDEX_CLOUD_S3_ENDPOINT=https://storage.yandexcloud.net
YANDEX_CLOUD_S3_BUCKET=videocloud-bucket
YANDEX_CLOUD_ACCESS_KEY_ID=your-access-key-id
YANDEX_CLOUD_SECRET_ACCESS_KEY=your-secret-access-key
```

### 4. Database Setup

```bash
# Start the database
docker-compose up -d db

# Or use your local PostgreSQL instance
# Make sure to create the database:
# createdb videocloud

# Run migrations
pnpm run backend:migration
```

### 5. Start Development Servers

```bash
# Start both frontend and backend
pnpm run dev

# Or start them separately
pnpm run frontend:dev
pnpm run backend:dev
```

## Project Structure

### Frontend (Vue.js)
```
frontend/
├── src/
│   ├── features/       # Feature modules (auth, videos, etc.)
│   │   ├── auth/
│   │   │   ├── api/    # API requests
│   │   │   ├── ui/     # UI components 
│   │   │   └── model/  # State management
│   │   └── ...
│   ├── shared/         # Shared code
│   │   ├── lib/        # Utilities
│   │   ├── ui/         # Common UI components
│   │   └── api/        # API utilities
│   └── app/            # Application entry point
└── ...
```

### Backend (NestJS)
```
backend/
├── src/
│   ├── auth/           # Authentication module
│   │   ├── dto/        # Data transfer objects
│   │   ├── guards/     # Auth guards
│   │   └── strategies/ # Auth strategies
│   ├── users/          # Users module
│   │   ├── dto/        # Data transfer objects
│   │   └── entities/   # Database entities
│   ├── config/         # Configuration
│   ├── shared/         # Shared services
│   │   └── services/
│   │       └── s3.service.ts
│   └── migrations/     # Database migrations
└── ...
```

## Verifying the Installation

1. Frontend should be available at: http://localhost:5173
2. Backend API should be available at: http://localhost:3000
3. API documentation should be available at: http://localhost:3000/api

## Next Steps

- [Quick Start Guide](./quickstart)
- [User Guide](/docs/user-guide/video-management)
- [API Documentation](/docs/api/api-overview)

## Troubleshooting

If you encounter any issues during installation:

1. Check the [FAQ](/docs/faq) for common problems
2. Ensure all prerequisites are installed correctly
3. Verify your environment variables
4. Check the logs for both frontend and backend services
5. Open an issue on GitHub if the problem persists 