#!/bin/bash

set -e

export ENV="${ENV:=testing}"

# Default values
REGISTRY="cr.yandex/crpthl8qb35r5jjhpc0v"
REPOSITORY="videocloud"
IMAGE_NAME="backend"
TAG=${ENV}

FULL_IMAGE_NAME="${REGISTRY}/${REPOSITORY}/${IMAGE_NAME}:${TAG}"

echo "===== Building Docker image: ${FULL_IMAGE_NAME} ====="

echo "Building Docker image directly from project..."
docker build --platform linux/amd64 -t ${FULL_IMAGE_NAME} -f Dockerfile ../../ --no-cache

echo "===== Docker image built successfully ====="

# Check if we need to push the image
echo "===== Pushing Docker image to registry ====="

docker login ${REGISTRY}

# Push the image
docker push ${FULL_IMAGE_NAME}

echo "===== Docker image pushed successfully to ${FULL_IMAGE_NAME} ====="

echo "===== Release process completed ====="
