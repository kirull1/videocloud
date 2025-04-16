#!/bin/bash

# Exit on error
set -e

export ENV="${ENV:=testing}"

# Default values
REGISTRY="cr.yandex/crpthl8qb35r5jjhpc0v"
REPOSITORY="videocloud"
IMAGE_NAME="frontend"
TAG=${ENV}

# Full image name with commit ID
FULL_IMAGE_NAME="${REGISTRY}/${REPOSITORY}/${IMAGE_NAME}:${TAG}"

echo "===== Building Docker image: ${FULL_IMAGE_NAME} ====="

# Create a temporary build context
BUILD_CONTEXT=$(mktemp -d)
cp -r ../../frontend/* "$BUILD_CONTEXT/"
cp nginx.conf "$BUILD_CONTEXT/"
# Copy tsconfig.base.json into the build context
cp ../../tsconfig.base.json "$BUILD_CONTEXT/"

# Install dependencies and generate lock file
echo "Installing dependencies and generating lock file..."
cd "$BUILD_CONTEXT"
pnpm install --lockfile-only
cd - > /dev/null

# Build the Docker image
docker build -t ${FULL_IMAGE_NAME} -f Dockerfile "$BUILD_CONTEXT"

# Clean up
rm -rf "$BUILD_CONTEXT"

echo "===== Docker image built successfully ====="

# Check if we need to push the image
echo "===== Pushing Docker image to registry ====="

docker login ${REGISTRY}

# Push the image
docker push ${FULL_IMAGE_NAME}

echo "===== Docker image pushed successfully to ${FULL_IMAGE_NAME} ====="

echo "===== Release process completed ====="
