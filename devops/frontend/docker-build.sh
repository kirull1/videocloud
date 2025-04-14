#!/bin/bash

# Exit on error
set -e

# Navigate to the frontend directory
cd ../../frontend

# Build the Docker image
echo "Building the frontend Docker image..."
docker build -t videocloud-frontend -f ../devops/frontend/Dockerfile .

# Run the container
echo "Running the frontend container..."
docker run -d -p 8080:80 --name videocloud-frontend-container videocloud-frontend

echo "Frontend is now running at http://localhost:8080"
