# Docker Setup for VideoCloud Frontend

This document provides instructions for building and running the VideoCloud frontend application using Docker.

## Prerequisites

- Docker installed on your machine
- Git repository cloned locally

## Files Overview

- `devops/frontend/Dockerfile`: Multi-stage build file for creating the frontend Docker image
- `devops/frontend/nginx.conf`: Custom Nginx configuration for serving the Vue.js SPA
- `devops/frontend/.dockerignore`: Specifies files to exclude from the Docker build context
- `devops/frontend/docker-build.sh`: Script to build and run the Docker container
- `devops/frontend/docker-stop.sh`: Script to stop and remove the Docker container

## Building and Running the Container

### Option 1: Using npm/pnpm scripts

1. Build the Docker image:

```bash
# From the project root
pnpm run frontend:release
```

2. Build and push the Docker image to a registry:

```bash
# From the project root
pnpm run frontend:release:push
```

You can also use the general release commands:

```bash
pnpm run release       # Build the Docker image
pnpm run release:push  # Build and push the Docker image
```

### Option 2: Using the provided scripts directly

1. Build and run the container:

```bash
cd devops/frontend
./docker-build.sh
```

This script will:
- Build the Docker image with the tag `videocloud-frontend`
- Run a container named `videocloud-frontend-container`
- Map port 8080 on your host to port 80 in the container

2. Access the application at http://localhost:8080

3. To stop and remove the container:

```bash
cd devops/frontend
./docker-stop.sh
```

4. To build and push the Docker image to a registry:

```bash
cd devops/frontend
./docker-release.sh --push
```

The release script supports the following options:
- `--registry`: Docker registry URL (default: cr.yandex/crpthl8qb35r5jjhpc0v)
- `--repository`: Repository name (default: videocloud)
- `--tag`: Image tag (default: latest)
- `--push`: Push the image to the registry

Example with custom options:
```bash
./docker-release.sh --registry cr.yandex/crpthl8qb35r5jjhpc0v --repository videocloud --tag v1.0.0 --push
```

### Option 3: Manual commands

1. Build the Docker image:

```bash
# From project root
pnpm run frontend:release                  # Build development image
pnpm run frontend:release:push             # Build and push development image
pnpm run frontend:release:production       # Build production image
pnpm run frontend:release:production:push  # Build and push production image

# Or using general release commands
pnpm run release                  # Build development image
pnpm run release:push             # Build and push development image
pnpm run release:production       # Build production image
pnpm run release:production:push  # Build and push production image
```

3. Stop the container:

```bash
docker stop videocloud-frontend-container
```

4. Remove the container:

```bash
docker rm videocloud-frontend-container
```

## Docker Image Details

The Docker image is built using a multi-stage build process:

1. **Build Stage**:
   - Uses Node.js 20.16.0 Alpine as the base image
   - Installs pnpm package manager
   - Copies configuration files and installs dependencies
   - Builds the Vue.js application

2. **Production Stage**:
   - Uses Nginx Alpine as the base image
   - Copies the built assets from the build stage
   - Applies custom Nginx configuration
   - Exposes port 80
   - Includes a health check

## Customization

### Environment Variables

To pass environment variables to the application, you can modify the Dockerfile to include ARG and ENV instructions, or use Docker's `-e` flag when running the container.

Example:

```bash
docker run -d -p 8080:80 -e API_URL=http://api.example.com --name videocloud-frontend-container videocloud-frontend
```

### Nginx Configuration

The `nginx.conf` file includes:
- Gzip compression for better performance
- SPA routing configuration (redirects to index.html)
- Cache settings for static assets
- Security headers
- Error page handling

You can modify this file to suit your specific requirements.

## Production Deployment Considerations

For production deployments, consider:

1. Using a container orchestration platform like Kubernetes or Docker Swarm
2. Setting up a CI/CD pipeline for automated builds and deployments
3. Implementing proper logging and monitoring
4. Using environment-specific configuration
5. Setting up HTTPS with proper certificates
