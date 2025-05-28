---
id: user-api
sidebar_position: 4
title: Справочник API для работы с пользователями
---

# Справочник API для работы с пользователями

API для работы с пользователями предоставляет конечные точки для управления учетными записями пользователей, профилями и настройками.

## Управление пользователями

### Получение текущего пользователя

Получение профиля аутентифицированного пользователя:

```http
GET /users/me
```

Ответ:

```json
{
  "success": true,
  "data": {
    "id": "usr_123456",
    "email": "user@example.com",
    "username": "username",
    "firstName": "Иван",
    "lastName": "Иванов",
    "avatarUrl": "https://avatars.videocloud.com/u/123456",
    "isEmailVerified": true,
    "role": "user",
    "preferences": {
      "notifications": {
        "email": true,
        "push": true
      },
      "privacy": {
        "profileVisibility": "public",
        "showEmail": false
      },
      "player": {
        "autoplay": false,
        "quality": "auto"
      }
    },
    "createdAt": "2024-03-31T12:00:00Z",
    "updatedAt": "2024-03-31T12:00:00Z"
  }
}
```

### Обновление текущего пользователя

Обновление профиля аутентифицированного пользователя:

```http
PUT /users/me
Content-Type: application/json

{
  "firstName": "Иван",
  "lastName": "Иванов",
  "username": "new_username",
  "preferences": {
    "notifications": {
      "email": false
    }
  }
}
```

### Получение пользователя по ID

Получение публичного профиля пользователя:

```http
GET /users/{id}
```

Ответ:

```json
{
  "success": true,
  "data": {
    "id": "usr_123456",
    "username": "username",
    "firstName": "Иван",
    "lastName": "Иванов",
    "avatarUrl": "https://avatars.videocloud.com/u/123456",
    "bio": "Создатель видео и энтузиаст",
    "stats": {
      "videos": 50,
      "followers": 1000,
      "following": 500
    },
    "createdAt": "2024-03-31T12:00:00Z"
  }
}
```

## Управление аватаром

### Загрузка аватара

Загрузка или обновление аватара пользователя:

```http
PUT /users/me/avatar
Content-Type: multipart/form-data

file: <image_file>
```

Ответ:

```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://avatars.videocloud.com/u/123456",
    "thumbnailUrl": "https://avatars.videocloud.com/u/123456/thumb"
  }
}
```

### Удаление аватара

Удаление аватара пользователя:

```http
DELETE /users/me/avatar
```

## Управление учетной записью

### Изменение пароля

Изменение пароля пользователя:

```http
PUT /users/me/password
Content-Type: application/json

{
  "currentPassword": "current_password",
  "newPassword": "new_secure_password"
}
```

### Удаление учетной записи

Удаление учетной записи пользователя:

```http
DELETE /users/me
```

## Настройки пользователя

### Получение настроек

Получение настроек пользователя:

```http
GET /users/me/preferences
```

Ответ:

```json
{
  "success": true,
  "data": {
    "notifications": {
      "email": {
        "newFollower": true,
        "newComment": true,
        "videoProcessed": true,
        "marketing": false
      },
      "push": {
        "newFollower": true,
        "newComment": true,
        "videoProcessed": true
      }
    },
    "privacy": {
      "profileVisibility": "public",
      "showEmail": false,
      "showStats": true,
      "allowMessages": true
    },
    "player": {
      "autoplay": false,
      "quality": "auto",
      "speed": 1.0,
      "subtitles": "off"
    },
    "language": "ru",
    "timezone": "UTC"
  }
}
```

### Обновление настроек

Обновление настроек пользователя:

```http
PUT /users/me/preferences
Content-Type: application/json

{
  "notifications": {
    "email": {
      "marketing": false
    }
  },
  "privacy": {
    "profileVisibility": "private"
  }
}
```

## Статистика пользователя

### Получение статистики пользователя

Получение статистики пользователя:

```http
GET /users/me/stats
```

Ответ:

```json
{
  "success": true,
  "data": {
    "videos": {
      "total": 50,
      "published": 45,
      "processing": 2,
      "draft": 3,
      "totalViews": 100000,
      "totalLikes": 5000,
      "totalComments": 2000,
      "totalWatchTime": 500000
    },
    "storage": {
      "used": 1073741824,
      "total": 10737418240,
      "percentUsed": 10
    },
    "bandwidth": {
      "used": 10737418240,
      "total": 107374182400,
      "percentUsed": 10
    },
    "social": {
      "followers": 1000,
      "following": 500
    }
  }
}
```

## Социальные функции

### Подписка на пользователя

Подписка на пользователя:

```http
POST /users/{id}/follow
```

Ответ:

```json
{
  "success": true,
  "data": {
    "following": true
  }
}
```

### Отписка от пользователя

Отписка от пользователя:

```http
DELETE /users/{id}/follow
```

Ответ:

```json
{
  "success": true,
  "data": {
    "following": false
  }
}
```

### Получение подписчиков

Получение списка подписчиков:

```http
GET /users/me/followers?page=1&limit=10
```

Параметры запроса:

| Параметр | Тип | Описание |
|-----------|------|-------------|
| `page` | число | Номер страницы (по умолчанию: 1) |
| `limit` | число | Элементов на странице (по умолчанию: 10, макс: 100) |

Ответ:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "usr_654321",
        "username": "follower1",
        "firstName": "Петр",
        "lastName": "Петров",
        "avatarUrl": "https://avatars.videocloud.com/u/654321",
        "followedAt": "2024-03-31T12:00:00Z"
      }
    ],
    "total": 1000,
    "page": 1,
    "limit": 10,
    "pages": 100
  }
}
```

### Получение подписок

Получение списка подписок:

```http
GET /users/me/following?page=1&limit=10
```

Ответ:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "usr_654321",
        "username": "following1",
        "firstName": "Мария",
        "lastName": "Сидорова",
        "avatarUrl": "https://avatars.videocloud.com/u/654321",
        "followedAt": "2024-03-31T12:00:00Z"
      }
    ],
    "total": 500,
    "page": 1,
    "limit": 10,
    "pages": 50
  }
}
``` 