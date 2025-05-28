---
sidebar_position: 3
---

# Video API

The Video API provides endpoints for managing videos, including upload, processing, streaming, and metadata management.

## Video Upload

Upload a new video:

```http
POST /videos
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <video_file>
title: My Video
description: Video description
tags: ["tag1", "tag2"]
privacy: public
```

Response:

```json
{
  "success": true,
  "data": {
    "video": {
      "id": "123",
      "title": "My Video",
      "description": "Video description",
      "status": "processing",
      "processingProgress": 0,
      "thumbnailUrl": "https://storage.videocloud.com/thumbnails/123.jpg",
      "createdAt": "2024-03-20T10:00:00Z"
    }
  },
  "error": null
}
```

### Upload Progress

Monitor upload progress using Server-Sent Events:

```http
GET /videos/:id/upload-progress
Authorization: Bearer <token>
```

Response (SSE):

```
event: progress
data: {"progress": 45, "status": "uploading"}

event: complete
data: {"status": "processing", "message": "Upload complete, processing started"}
```

## Video Processing

### Processing Status

Get video processing status:

```http
GET /videos/:id/status
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "status": "processing",
    "progress": 75,
    "currentStep": "transcoding",
    "estimatedTimeRemaining": "2 minutes"
  },
  "error": null
}
```

### Processing Progress

Monitor processing progress using Server-Sent Events:

```http
GET /videos/:id/processing-progress
Authorization: Bearer <token>
```

Response (SSE):

```
event: progress
data: {"progress": 75, "status": "processing", "step": "transcoding"}

event: complete
data: {"status": "ready", "message": "Processing complete"}
```

## Video Management

### List Videos

Get a list of videos:

```http
GET /videos
Authorization: Bearer <token>
Query Parameters:
  - page: 1
  - limit: 20
  - sort: created_at
  - order: desc
  - privacy: public
  - tags: ["tag1", "tag2"]
```

Response:

```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "id": "123",
        "title": "My Video",
        "description": "Video description",
        "status": "ready",
        "duration": 120,
        "thumbnailUrl": "https://storage.videocloud.com/thumbnails/123.jpg",
        "views": 1000,
        "createdAt": "2024-03-20T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "pages": 5
    }
  },
  "error": null
}
```

### Get Video

Get a specific video:

```http
GET /videos/:id
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "video": {
      "id": "123",
      "title": "My Video",
      "description": "Video description",
      "status": "ready",
      "duration": 120,
      "thumbnailUrl": "https://storage.videocloud.com/thumbnails/123.jpg",
      "streamingUrl": "https://stream.videocloud.com/videos/123/master.m3u8",
      "views": 1000,
      "tags": ["tag1", "tag2"],
      "privacy": "public",
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z"
    }
  },
  "error": null
}
```

### Update Video

Update video metadata:

```http
PATCH /videos/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["tag1", "tag2", "tag3"],
  "privacy": "private"
}
```

### Delete Video

Delete a video:

```http
DELETE /videos/:id
Authorization: Bearer <token>
```

## Video Streaming

### Get Streaming URL

Get the streaming URL for a video:

```http
GET /videos/:id/stream
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "streamingUrl": "https://stream.videocloud.com/videos/123/master.m3u8",
    "expiresAt": "2024-03-20T11:00:00Z"
  },
  "error": null
}
```

### Get Streaming Info

Get detailed streaming information:

```http
GET /videos/:id/streaming-info
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "formats": [
      {
        "quality": "1080p",
        "url": "https://stream.videocloud.com/videos/123/1080p.m3u8",
        "bitrate": "5000kbps"
      },
      {
        "quality": "720p",
        "url": "https://stream.videocloud.com/videos/123/720p.m3u8",
        "bitrate": "2500kbps"
      }
    ],
    "subtitles": [
      {
        "language": "en",
        "url": "https://stream.videocloud.com/videos/123/en.vtt"
      }
    ],
    "expiresAt": "2024-03-20T11:00:00Z"
  },
  "error": null
}
```

## Thumbnails

### Upload Thumbnail

Upload a custom thumbnail:

```http
POST /videos/:id/thumbnail
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <image_file>
```

### Generate Thumbnail

Generate a thumbnail from the video:

```http
POST /videos/:id/thumbnail/generate
Content-Type: application/json
Authorization: Bearer <token>

{
  "timestamp": 10, // seconds from start
  "width": 1280,
  "height": 720
}
```

## Analytics

### Get Video Analytics

Get analytics for a video:

```http
GET /videos/:id/analytics
Authorization: Bearer <token>
Query Parameters:
  - startDate: 2024-03-01
  - endDate: 2024-03-20
  - metrics: ["views", "watchTime", "engagement"]
```

Response:

```json
{
  "success": true,
  "data": {
    "views": {
      "total": 1000,
      "daily": [
        {"date": "2024-03-20", "count": 100},
        {"date": "2024-03-19", "count": 90}
      ]
    },
    "watchTime": {
      "total": 3600,
      "average": 120
    },
    "engagement": {
      "likes": 50,
      "comments": 10,
      "shares": 5
    }
  },
  "error": null
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VIDEO_NOT_FOUND` | Video not found |
| `VIDEO_NOT_READY` | Video is still processing |
| `VIDEO_UPLOAD_FAILED` | Video upload failed |
| `VIDEO_PROCESSING_FAILED` | Video processing failed |
| `VIDEO_DELETE_FAILED` | Video deletion failed |
| `VIDEO_UPDATE_FAILED` | Video update failed |
| `VIDEO_STREAMING_FAILED` | Video streaming failed |
| `VIDEO_THUMBNAIL_FAILED` | Thumbnail operation failed |

## SDK Examples

### JavaScript/TypeScript

```typescript
import { VideoCloud } from '@videocloud/sdk';

const client = new VideoCloud({
  apiKey: 'your-api-key'
});

// Upload video
const { video } = await client.videos.upload({
  file: videoFile,
  title: 'My Video',
  description: 'Video description',
  tags: ['tag1', 'tag2'],
  privacy: 'public'
});

// Monitor processing
client.videos.onProcessingProgress(video.id, (progress) => {
  console.log(`Processing: ${progress}%`);
});

// Get video
const video = await client.videos.get(videoId);

// Update video
await client.videos.update(videoId, {
  title: 'Updated Title',
  description: 'Updated description'
});

// Get streaming URL
const { streamingUrl } = await client.videos.getStreamingUrl(videoId);

// Delete video
await client.videos.delete(videoId);
```

### Python

```python
from videocloud import VideoCloud

client = VideoCloud(api_key='your-api-key')

# Upload video
video = client.videos.upload(
    file=video_file,
    title='My Video',
    description='Video description',
    tags=['tag1', 'tag2'],
    privacy='public'
)

# Monitor processing
for progress in client.videos.processing_progress(video.id):
    print(f'Processing: {progress}%')

# Get video
video = client.videos.get(video_id)

# Update video
client.videos.update(
    video_id,
    title='Updated Title',
    description='Updated description'
)

# Get streaming URL
streaming_url = client.videos.get_streaming_url(video_id)

# Delete video
client.videos.delete(video_id)
```

## Best Practices

1. **Upload**
   - Use resumable uploads for large files
   - Implement progress monitoring
   - Handle upload failures gracefully
   - Validate file types and sizes

2. **Processing**
   - Monitor processing status
   - Handle processing failures
   - Implement retry logic
   - Cache processing results

3. **Streaming**
   - Use adaptive bitrate streaming
   - Implement proper caching
   - Handle streaming errors
   - Monitor streaming performance

4. **Analytics**
   - Track important metrics
   - Implement proper data aggregation
   - Cache analytics results
   - Handle analytics failures gracefully 