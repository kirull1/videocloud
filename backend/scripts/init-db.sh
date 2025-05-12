#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found"
    exit 1
fi

# Default values if not set in .env
DB_HOST=${DATABASE_HOST:-localhost}
DB_PORT=${DATABASE_PORT:-5432}
DB_USER=${DATABASE_USER:-postgres}
DB_PASSWORD=${DATABASE_PASSWORD:-postgres}
DB_NAME=${DATABASE_NAME:-videocloud}

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "Error: PostgreSQL is not installed"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
    echo "Error: PostgreSQL is not running"
    exit 1
fi

echo "Initializing database..."

# Create database and run initialization script
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -f "$(dirname "$0")/init-db.sql"

if [ $? -eq 0 ]; then
    echo "Database initialized successfully"
else
    echo "Error: Failed to initialize database"
    exit 1
fi 