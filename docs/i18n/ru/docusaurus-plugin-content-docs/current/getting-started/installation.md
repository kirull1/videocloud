---
id: installation
sidebar_position: 1
---

# Установка

Это руководство поможет вам установить и запустить VideoCloud на вашей системе.

## Предварительные требования

Перед началом убедитесь, что у вас установлены следующие компоненты:

- Node.js (версия 22.14.0 или выше)
- pnpm (версия 10.8.1 или выше)
- PostgreSQL 16
- Docker и Docker Compose (для контейнеризированного развертывания, опционально)
- Git

## Шаги установки

### 1. Клонирование репозитория

```bash
git clone https://github.com/kirull1/video-cloud.git
cd video-cloud
```

### 2. Установка зависимостей

```bash
pnpm install
```

### 3. Настройка окружения

Создайте файл `.env` в корневом каталоге со следующими переменными:

```env
# База данных
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=videocloud

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRATION=1d

# CORS
CORS_ORIGIN=http://localhost:5173

# Фронтенд
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=VideoCloud

# Хранилище S3 (если используется облачное хранилище)
YANDEX_CLOUD_REGION=ru-central1
YANDEX_CLOUD_S3_ENDPOINT=https://storage.yandexcloud.net
YANDEX_CLOUD_S3_BUCKET=videocloud-bucket
YANDEX_CLOUD_ACCESS_KEY_ID=your-access-key-id
YANDEX_CLOUD_SECRET_ACCESS_KEY=your-secret-access-key
```

### 4. Настройка базы данных

```bash
# Запуск базы данных
docker-compose up -d db

# Или используйте локальный экземпляр PostgreSQL
# Убедитесь, что база данных создана:
# createdb videocloud

# Запуск миграций
pnpm run backend:migration
```

### 5. Запуск серверов разработки

```bash
# Запуск фронтенда и бэкенда одновременно
pnpm run dev

# Или запуск их по отдельности
pnpm run frontend:dev
pnpm run backend:dev
```

## Структура проекта

### Фронтенд (Vue.js)
```
frontend/
├── src/
│   ├── features/       # Модули функций (auth, videos и т.д.)
│   │   ├── auth/
│   │   │   ├── api/    # API-запросы
│   │   │   ├── ui/     # UI-компоненты 
│   │   │   └── model/  # Управление состоянием
│   │   └── ...
│   ├── shared/         # Общий код
│   │   ├── lib/        # Утилиты
│   │   ├── ui/         # Общие UI-компоненты
│   │   └── api/        # API-утилиты
│   └── app/            # Точка входа приложения
└── ...
```

### Бэкенд (NestJS)
```
backend/
├── src/
│   ├── auth/           # Модуль аутентификации
│   │   ├── dto/        # Объекты передачи данных
│   │   ├── guards/     # Защита аутентификации
│   │   └── strategies/ # Стратегии аутентификации
│   ├── users/          # Модуль пользователей
│   │   ├── dto/        # Объекты передачи данных
│   │   └── entities/   # Сущности базы данных
│   ├── config/         # Конфигурация
│   ├── shared/         # Общие сервисы
│   │   └── services/
│   │       └── s3.service.ts
│   └── migrations/     # Миграции базы данных
└── ...
```

## Проверка установки

1. Фронтенд должен быть доступен по адресу: http://localhost:5173
2. API бэкенда должен быть доступен по адресу: http://localhost:3000
3. Документация API должна быть доступна по адресу: http://localhost:3000/api

## Следующие шаги

- [Краткое руководство](./quickstart)
- [Руководство пользователя](/docs/user-guide/video-management)
- [Документация API](/docs/api/api-overview)

## Устранение неполадок

Если вы столкнулись с проблемами во время установки:

1. Проверьте [FAQ](/docs/faq) для распространенных проблем
2. Убедитесь, что все предварительные требования установлены правильно
3. Проверьте переменные окружения
4. Проверьте логи для фронтенда и бэкенда
5. Создайте issue на GitHub, если проблема сохраняется 