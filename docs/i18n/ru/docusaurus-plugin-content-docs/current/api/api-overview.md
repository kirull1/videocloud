---
id: api-overview
sidebar_position: 1
---

# Обзор API

Добро пожаловать в документацию API VideoCloud. Это руководство поможет вам понять и использовать наш RESTful API для интеграции VideoCloud в ваши приложения.

## Начало работы

1. [Аутентификация](/docs/api/authentication)
2. [Video API](/docs/api/video-api)
3. [User API](/docs/api/user-api)
4. [Analytics API](/docs/api/analytics-api)
5. [Вебхуки](/docs/api/webhooks)

## Базовый URL

Все API-запросы должны быть отправлены на:

```
https://api.videocloud.com/v1
```

## Аутентификация

Все API-запросы требуют аутентификации с использованием API-ключей. Узнайте больше об [аутентификации](/docs/api/authentication).

## Ограничение скорости

API-запросы имеют ограничения скорости:

- 100 запросов в минуту для стандартных планов
- 1000 запросов в минуту для корпоративных планов

## Формат ответа

Все ответы представлены в формате JSON и включают:

- `data`: Запрошенные данные
- `meta`: Метаданные об ответе
- `error`: Информация об ошибке (если применимо)

Пример ответа:

```json
{
  "data": {
    "id": "video_123",
    "title": "Пример видео",
    "status": "ready"
  },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2024-03-20T12:00:00Z"
  }
}
```

## Обработка ошибок

Ошибки возвращаются с соответствующими HTTP-кодами состояния и сообщениями об ошибках:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Недействительный API-ключ",
    "status": 401
  }
}
```

## SDKs

Мы предоставляем официальные SDK для популярных языков программирования:

- JavaScript SDK
- Python SDK
- Ruby SDK
- PHP SDK
- Go SDK

## Вебхуки

Узнайте, как получать уведомления о событиях в вашей учетной записи VideoCloud в реальном времени:

- [Обзор вебхуков](/docs/api/webhooks)
- [Типы событий](/docs/api/webhooks#event-types)
- [Безопасность](/docs/api/webhooks#security)

## Поддержка

- [Статус API](https://status.videocloud.com)
- [Центр поддержки](https://support.videocloud.com)
- [Форумы сообщества](https://community.videocloud.com) 