FROM node:22.14.0-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

COPY frontend/package.json frontend/pnpm-lock.yaml* ./
COPY frontend/tsconfig*.json ./
COPY tsconfig.base.json ../
COPY frontend/vite.config.ts ./
COPY frontend/env.d.ts ./
COPY frontend/index.html ./

RUN pnpm install --force

COPY frontend/src/ ./src/
COPY frontend/public/ ./public/

RUN pnpm run build-only

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY devops/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
