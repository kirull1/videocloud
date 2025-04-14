# DevOps Directory

This directory contains DevOps-related configurations, scripts, and documentation for the VideoCloud project.

## Structure

- `frontend/` - Docker and deployment configurations for the frontend application
  - `Dockerfile` - Multi-stage build file for the frontend
  - `nginx.conf` - Nginx configuration for serving the Vue.js SPA
  - `.dockerignore` - Files to exclude from the Docker build context
  - `docker-build.sh` - Script to build and run the frontend Docker container
  - `docker-stop.sh` - Script to stop and remove the frontend Docker container
  - `docker-readme.md` - Documentation for the frontend Docker setup

## Usage

### Frontend Docker Setup

To build and run the frontend Docker container:

```bash
cd devops/frontend
./docker-build.sh
```

To stop and remove the frontend Docker container:

```bash
cd devops/frontend
./docker-stop.sh
```

For more detailed information about the frontend Docker setup, please refer to the [frontend Docker README](frontend/docker-readme.md).

## Future Additions

The following DevOps configurations will be added in the future:

1. Backend Docker setup
2. Docker Compose configuration for running the entire application stack
3. Kubernetes manifests for production deployment
4. CI/CD pipeline configurations
5. Monitoring and logging setup
6. Infrastructure as Code (IaC) templates
