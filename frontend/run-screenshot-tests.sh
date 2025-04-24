#!/bin/bash

# Start Storybook in the background
echo "Starting Storybook..."
pnpm run storybook &
STORYBOOK_PID=$!

# Wait for Storybook to start
echo "Waiting for Storybook to start (30 seconds)..."
sleep 30

# Run the screenshot tests
echo "Running screenshot tests..."
pnpm run test:screenshots

# Capture the exit code
EXIT_CODE=$?

# Kill Storybook
echo "Stopping Storybook..."
kill $STORYBOOK_PID

# Exit with the test exit code
exit $EXIT_CODE