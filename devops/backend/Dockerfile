FROM node:22.14.0-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

RUN apk update && apk add --no-cache ffmpeg

COPY backend/package.json backend/pnpm-lock.yaml* ./
COPY backend/tsconfig*.json ./
COPY tsconfig.base.json ../

RUN pnpm install

COPY backend/src/ ./src/
COPY backend/scripts/ ./scripts/

RUN pnpm run getSSL

RUN pnpm run build

EXPOSE 3001

CMD ["pnpm", "run", "start"]
