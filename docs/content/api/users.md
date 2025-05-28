---
sidebar_position: 4
---

# User API

The User API provides endpoints for managing user profiles, avatars, and account settings.

## User Profile

### Get Profile

Get the current user's profile:

```http
GET /users/profile
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "username": "username",
      "displayName": "Display Name",
      "bio": "User bio",
      "avatarUrl": "https://storage.videocloud.com/avatars/123.jpg",
      "isEmailVerified": true,
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z"
    }
  },
  "error": null
}
```

### Update Profile

Update the current user's profile:

```http
PATCH /users/profile
Content-Type: application/json
Authorization: Bearer <token>

{
  "displayName": "New Display Name",
  "bio": "Updated bio",
  "email": "newemail@example.com"
}
```

### Get User by ID

Get another user's public profile:

```http
GET /users/:id
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "username",
      "displayName": "Display Name",
      "bio": "User bio",
      "avatarUrl": "https://storage.videocloud.com/avatars/123.jpg",
      "createdAt": "2024-03-20T10:00:00Z",
      "stats": {
        "videos": 10,
        "followers": 100,
        "following": 50
      }
    }
  },
  "error": null
}
```

## Avatar Management

### Upload Avatar

Upload a new avatar:

```http
POST /users/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <image_file>
```

Response:

```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://storage.videocloud.com/avatars/123.jpg"
  },
  "error": null
}
```

### Get Avatar

Get a user's avatar:

```http
GET /users/:id/avatar
```

This endpoint will:
1. Return the user's custom avatar if one exists
2. Generate a default avatar using the user's username if no custom avatar exists

### Delete Avatar

Delete the current user's avatar:

```http
DELETE /users/avatar
Authorization: Bearer <token>
```

## Account Settings

### Change Password

Change the current user's password:

```http
PATCH /users/password
Content-Type: application/json
Authorization: Bearer <token>

{
  "currentPassword": "currentpassword",
  "newPassword": "newpassword"
}
```

### Update Email

Update the current user's email:

```http
PATCH /users/email
Content-Type: application/json
Authorization: Bearer <token>

{
  "email": "newemail@example.com",
  "password": "currentpassword"
}
```

### Delete Account

Delete the current user's account:

```http
DELETE /users/account
Content-Type: application/json
Authorization: Bearer <token>

{
  "password": "currentpassword",
  "confirmation": "DELETE"
}
```

## Privacy Settings

### Get Privacy Settings

Get the current user's privacy settings:

```http
GET /users/privacy
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "settings": {
      "profileVisibility": "public",
      "showEmail": false,
      "showStats": true,
      "allowMessages": true,
      "notifications": {
        "email": true,
        "push": true,
        "marketing": false
      }
    }
  },
  "error": null
}
```

### Update Privacy Settings

Update the current user's privacy settings:

```http
PATCH /users/privacy
Content-Type: application/json
Authorization: Bearer <token>

{
  "profileVisibility": "private",
  "showEmail": false,
  "showStats": true,
  "allowMessages": false,
  "notifications": {
    "email": true,
    "push": false,
    "marketing": false
  }
}
```

## User Statistics

### Get User Stats

Get statistics for a user:

```http
GET /users/:id/stats
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "stats": {
      "videos": {
        "total": 10,
        "public": 8,
        "private": 2
      },
      "views": {
        "total": 10000,
        "average": 1000
      },
      "engagement": {
        "likes": 500,
        "comments": 100,
        "shares": 50
      },
      "followers": {
        "total": 100,
        "growth": 10
      },
      "following": {
        "total": 50,
        "growth": 5
      }
    }
  },
  "error": null
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `USER_NOT_FOUND` | User not found |
| `USER_UPDATE_FAILED` | User update failed |
| `USER_DELETE_FAILED` | User deletion failed |
| `USER_AVATAR_FAILED` | Avatar operation failed |
| `USER_PASSWORD_INVALID` | Invalid password |
| `USER_EMAIL_TAKEN` | Email already in use |
| `USER_USERNAME_TAKEN` | Username already taken |
| `USER_PRIVACY_UPDATE_FAILED` | Privacy settings update failed |

## SDK Examples

### JavaScript/TypeScript

```typescript
import { VideoCloud } from '@videocloud/sdk';

const client = new VideoCloud({
  apiKey: 'your-api-key'
});

// Get profile
const { user } = await client.users.getProfile();

// Update profile
await client.users.updateProfile({
  displayName: 'New Display Name',
  bio: 'Updated bio'
});

// Upload avatar
const { avatarUrl } = await client.users.uploadAvatar(avatarFile);

// Get user
const { user } = await client.users.get(userId);

// Update privacy settings
await client.users.updatePrivacy({
  profileVisibility: 'private',
  showEmail: false
});

// Get user stats
const { stats } = await client.users.getStats(userId);

// Delete account
await client.users.deleteAccount({
  password: 'currentpassword',
  confirmation: 'DELETE'
});
```

### Python

```python
from videocloud import VideoCloud

client = VideoCloud(api_key='your-api-key')

# Get profile
user = client.users.get_profile()

# Update profile
client.users.update_profile(
    display_name='New Display Name',
    bio='Updated bio'
)

# Upload avatar
avatar_url = client.users.upload_avatar(avatar_file)

# Get user
user = client.users.get(user_id)

# Update privacy settings
client.users.update_privacy(
    profile_visibility='private',
    show_email=False
)

# Get user stats
stats = client.users.get_stats(user_id)

# Delete account
client.users.delete_account(
    password='currentpassword',
    confirmation='DELETE'
)
```

## Best Practices

1. **Profile Management**
   - Validate user input
   - Handle file uploads securely
   - Implement proper caching
   - Update related data atomically

2. **Avatar Handling**
   - Validate image types and sizes
   - Generate multiple sizes
   - Implement proper caching
   - Handle upload failures

3. **Privacy**
   - Respect user privacy settings
   - Implement proper access control
   - Cache privacy settings
   - Handle privacy updates atomically

4. **Security**
   - Use HTTPS for all requests
   - Implement rate limiting
   - Validate user input
   - Handle sensitive data securely
   - Implement proper logging
   - Monitor for suspicious activity 