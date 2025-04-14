# Stage 1: Build the application
FROM node:20.16.0-alpine AS build

# Set working directory
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@7.33.6 --activate

# Copy package.json and other configuration files
COPY package.json pnpm-lock.yaml* ./
COPY .npmrc ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY env.d.ts ./
COPY index.html ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# Build the application
RUN pnpm build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY ../devops/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -qO- http://localhost/ || exit 1

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
