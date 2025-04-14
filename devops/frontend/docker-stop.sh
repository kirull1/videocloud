#!/bin/bash

# Navigate to the frontend directory
cd ../../frontend

# Stop the container if it's running
if [ "$(docker ps -q -f name=videocloud-frontend-container)" ]; then
    echo "Stopping the frontend container..."
    docker stop videocloud-frontend-container
fi

# Remove the container if it exists
if [ "$(docker ps -a -q -f name=videocloud-frontend-container)" ]; then
    echo "Removing the frontend container..."
    docker rm videocloud-frontend-container
fi

echo "Frontend container stopped and removed."
