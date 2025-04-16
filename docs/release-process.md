# Release Process

This document describes the release process for the VideoCloud project, including building and publishing Docker images.

## Overview

The VideoCloud project uses Docker for containerization and follows a structured release process. The release process includes:

1. Building Docker images for each component (frontend, backend)
2. Tagging the images with appropriate version numbers
3. Pushing the images to a Docker registry
4. Deploying the images to the target environment

## Docker Images

### Frontend

The frontend Docker image is built using a multi-stage build process:

1. **Build Stage**: Uses Node.js to build the Vue.js application
2. **Production Stage**: Uses Nginx to serve the built application

The frontend image is configured with:
- Optimized Nginx settings for serving a Single Page Application
- Gzip compression for better performance
- Security headers for enhanced protection
- Health check for container monitoring

### Backend (Coming Soon)

The backend Docker image will be built using a similar multi-stage build process.

## Release Commands

The project provides several commands for building and releasing Docker images:

### Using npm/pnpm

```bash
# Development release
pnpm run release                  # Build development Docker image
pnpm run release:push             # Build and push development Docker image

# Production release
pnpm run release:production       # Build production Docker image
pnpm run release:production:push  # Build and push production Docker image

# Frontend-specific commands
pnpm run frontend:release                  # Build frontend development Docker image
pnpm run frontend:release:push             # Build and push frontend development Docker image
pnpm run frontend:release:production       # Build frontend production Docker image
pnpm run frontend:release:production:push  # Build and push frontend production Docker image
```

### Using Scripts Directly

```bash
# Development release
cd devops/frontend
./docker-release.sh              # Build development image
./docker-release.sh --push      # Build and push development image

# Production release
cd devops/frontend
./docker-release-production.sh              # Build production image
./docker-release-production.sh --push      # Build and push production image
```

Each script automatically includes the Git commit ID in the image tag for traceability. The development image is tagged as `latest-{commit-id}`, while the production image is tagged as both `production-{commit-id}` and `production`.

## Versioning

The project follows [Semantic Versioning](https://semver.org/) for tagging releases:

- **Major version**: Incompatible API changes
- **Minor version**: Backwards-compatible functionality additions
- **Patch version**: Backwards-compatible bug fixes

Example version tags:
- `v1.0.0`: Initial release
- `v1.1.0`: New features added
- `v1.1.1`: Bug fixes

## Release Workflow

### Development Releases

Development releases are created automatically from the `develop` branch:
1. Code is merged into the `develop` branch
2. CI/CD pipeline builds and tags the image with `dev-{commit-hash}`
3. Image is pushed to the development registry
4. Image is deployed to the development environment

### Production Releases

Production releases follow a more controlled process:
1. A release branch is created from `develop` (e.g., `release/v1.0.0`)
2. Final testing and bug fixes are applied to the release branch
3. The release branch is merged into `main`
4. A git tag is created (e.g., `v1.0.0`)
5. CI/CD pipeline builds and tags the image with the version number
6. Image is pushed to the production registry
7. Image is deployed to the production environment

## Registry Authentication

Before pushing images to a registry, you need to authenticate:

```bash
# Yandex Cloud Container Registry
docker login --username oauth --password <OAuth_TOKEN> cr.yandex

# Docker Hub
docker login

# GitHub Container Registry
docker login ghcr.io -u USERNAME -p TOKEN

# AWS ECR
aws ecr get-login-password --region REGION | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com
```

To get an OAuth token for Yandex Cloud:
1. Go to https://oauth.yandex.com/authorize?response_type=token&client_id=1a6990aa636648e9b2ef855fa7bec2fb
2. Log in to your Yandex account
3. Copy the OAuth token from the URL

## Continuous Integration

The project uses GitHub Actions for CI/CD. The workflow includes:
1. Building and testing the application
2. Building Docker images
3. Pushing images to the registry
4. Deploying to the target environment

The CI/CD pipeline is configured to:
- Build and test on every pull request
- Build and push development images on merge to `develop`
- Build and push production images on merge to `main`

## Deployment

Deployment is handled through:
1. Manual deployment using Docker Compose for development
2. Automated deployment using Kubernetes for staging and production

### Docker Compose Deployment

For local development:
```bash
docker-compose up -d
```

### Kubernetes Deployment (Coming Soon)

Kubernetes manifests will be provided for deploying to staging and production environments.
