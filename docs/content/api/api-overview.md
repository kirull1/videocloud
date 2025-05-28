---
id: api-overview
sidebar_position: 1
---

# API Overview

Welcome to the VideoCloud API documentation. This guide will help you understand and use our RESTful API to integrate VideoCloud into your applications.

## Getting Started

1. [Authentication](/docs/api/authentication)
2. [Video API](/docs/api/video-api)
3. [User API](/docs/api/user-api)
4. [Analytics API](/docs/api/analytics-api)
5. [Webhooks](/docs/api/webhooks)

## Base URL

All API requests should be made to:

```
https://api.videocloud.com/v1
```

## Authentication

All API requests require authentication using API keys. Learn more about [authentication](/docs/api/authentication).

## Rate Limiting

API requests are subject to rate limiting:

- 100 requests per minute for standard plans
- 1000 requests per minute for enterprise plans

## Response Format

All responses are in JSON format and include:

- `data`: The requested data
- `meta`: Metadata about the response
- `error`: Error information (if applicable)

Example response:

```json
{
  "data": {
    "id": "video_123",
    "title": "Example Video",
    "status": "ready"
  },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2024-03-20T12:00:00Z"
  }
}
```

## Error Handling

Errors are returned with appropriate HTTP status codes and error messages:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Invalid API key",
    "status": 401
  }
}
```

## SDKs

We provide official SDKs for popular programming languages:

- JavaScript SDK
- Python SDK
- Ruby SDK
- PHP SDK
- Go SDK

## Webhooks

Learn how to receive real-time notifications about events in your VideoCloud account:

- [Webhook Overview](/docs/api/webhooks)
- [Event Types](/docs/api/webhooks#event-types)
- [Security](/docs/api/webhooks#security)

## Support

- [API Status](https://status.videocloud.com)
- [Support Center](https://support.videocloud.com)
- [Community Forums](https://community.videocloud.com) 