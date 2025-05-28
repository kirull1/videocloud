---
id: user-api
sidebar_position: 4
title: User API Reference
---

# User API Reference

The User API provides endpoints for managing user accounts, profiles, and preferences.

## User Management

### Get Current User

Get the authenticated user's profile:

```http
GET /users/me
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "usr_123456",
    "email": "user@example.com",
    "username": "username",
    "firstName": "John",
    "lastName": "Doe",
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

### Update Current User

Update the authenticated user's profile:

```http
PUT /users/me
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "username": "new_username",
  "preferences": {
    "notifications": {
      "email": false
    }
  }
}
```

### Get User by ID

Get a user's public profile:

```http
GET /users/{id}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "usr_123456",
    "username": "username",
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": "https://avatars.videocloud.com/u/123456",
    "bio": "Video creator and enthusiast",
    "stats": {
      "videos": 50,
      "followers": 1000,
      "following": 500
    },
    "createdAt": "2024-03-31T12:00:00Z"
  }
}
```

## Avatar Management

### Upload Avatar

Upload or update user avatar:

```http
PUT /users/me/avatar
Content-Type: multipart/form-data

file: <image_file>
```

Response:

```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://avatars.videocloud.com/u/123456",
    "thumbnailUrl": "https://avatars.videocloud.com/u/123456/thumb"
  }
}
```

### Delete Avatar

Remove user avatar:

```http
DELETE /users/me/avatar
```

## Account Management

### Change Password

Change user password:

```http
PUT /users/me/password
Content-Type: application/json

{
  "currentPassword": "current_password",
  "newPassword": "new_secure_password"
}
```

### Delete Account

Delete user account:

```http
DELETE /users/me
```

## User Preferences

### Get Preferences

Get user preferences:

```http
GET /users/me/preferences
```

Response:

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
    "language": "en",
    "timezone": "UTC"
  }
}
```

### Update Preferences

Update user preferences:

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

## User Statistics

### Get User Stats

Get user statistics:

```http
GET /users/me/stats
```

Response:

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
      "totalComments": 1000
    },
    "engagement": {
      "followers": 1000,
      "following": 500,
      "averageViews": 2000,
      "averageWatchTime": 120,
      "completionRate": 0.75
    },
    "activity": {
      "lastLogin": "2024-03-31T12:00:00Z",
      "lastUpload": "2024-03-30T12:00:00Z",
      "uploadStreak": 5
    }
  }
}
```

## User Videos

### Get User Videos

Get videos uploaded by a user:

```http
GET /users/{id}/videos?page=1&limit=10
```

Query Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `status` | string | Filter by status (published, processing) |
| `sort` | string | Sort field (createdAt, views) |
| `order` | string | Sort order (asc, desc) |

## User Followers

### Get Followers

Get user's followers:

```http
GET /users/{id}/followers?page=1&limit=20
```

### Get Following

Get users that the user follows:

```http
GET /users/{id}/following?page=1&limit=20
```

### Follow User

Follow a user:

```http
POST /users/{id}/follow
```

### Unfollow User

Unfollow a user:

```http
DELETE /users/{id}/follow
```

## User Activity

### Get Activity Feed

Get user's activity feed:

```http
GET /users/me/activity?page=1&limit=20
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "type": "video_upload",
        "video": {
          "id": "vid_123456",
          "title": "My Video",
          "thumbnailUrl": "https://thumb.videocloud.com/v/123456"
        },
        "timestamp": "2024-03-31T12:00:00Z"
      },
      {
        "type": "new_follower",
        "user": {
          "id": "usr_789012",
          "username": "follower",
          "avatarUrl": "https://avatars.videocloud.com/u/789012"
        },
        "timestamp": "2024-03-31T11:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

## Error Handling

Common user API errors:

| Code | Description |
|------|-------------|
| `USER_NOT_FOUND` | User not found |
| `USER_ACCESS_DENIED` | Insufficient permissions |
| `USER_EMAIL_EXISTS` | Email already in use |
| `USER_USERNAME_EXISTS` | Username already taken |
| `USER_INVALID_PASSWORD` | Invalid password |
| `USER_ACCOUNT_LOCKED` | Account temporarily locked |
| `USER_EMAIL_NOT_VERIFIED` | Email not verified |

## SDK Examples

### JavaScript/TypeScript

```typescript
import { VideoCloud } from '@videocloud/sdk';

const client = new VideoCloud({
  apiKey: 'your_api_key'
});

// Get current user
const getCurrentUser = async () => {
  const user = await client.users.getCurrent();
  console.log(user.username);
};

// Update profile
const updateProfile = async () => {
  const user = await client.users.update({
    firstName: 'John',
    lastName: 'Doe'
  });
  console.log(user.firstName);
};

// Upload avatar
const uploadAvatar = async () => {
  const response = await client.users.uploadAvatar(avatarFile);
  console.log(response.avatarUrl);
};
```

### Python

```python
from videocloud import VideoCloud

client = VideoCloud(api_key='your_api_key')

# Get current user
user = client.users.get_current()
print(user.username)

# Update profile
user = client.users.update(
    first_name='John',
    last_name='Doe'
)
print(user.first_name)

# Upload avatar
response = client.users.upload_avatar('avatar.jpg')
print(response.avatar_url)
```

## Related Documentation

- [API Overview](./overview)
- [Authentication Guide](./authentication)
- [Video API](./video-api)
<!-- - [SDK Documentation](../sdk/overview) --> 