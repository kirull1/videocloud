# Yandex Cloud S3 Integration

This document provides instructions on how to set up and use Yandex Cloud S3 integration for storing video files and thumbnails.

## Prerequisites

1. A Yandex Cloud account
2. A created S3 bucket in Yandex Cloud Object Storage
3. Access key and secret key for your Yandex Cloud account

## Configuration

1. Create a `.env` file in the backend directory based on the `.env.example` file:

```bash
cp .env.example .env
```

2. Update the following environment variables in the `.env` file:

```
# Yandex Cloud S3
YANDEX_CLOUD_REGION=ru-central1
YANDEX_CLOUD_S3_ENDPOINT=https://storage.yandexcloud.net
YANDEX_CLOUD_S3_BUCKET=your-bucket-name
YANDEX_CLOUD_ACCESS_KEY_ID=your-access-key-id
YANDEX_CLOUD_SECRET_ACCESS_KEY=your-secret-access-key
S3_PUBLIC_URL_EXPIRATION=3600
```

Replace `your-bucket-name`, `your-access-key-id`, and `your-secret-access-key` with your actual Yandex Cloud S3 bucket name, access key ID, and secret access key.

## How It Works

The S3 integration provides the following functionality:

1. **Video Upload**: When a user uploads a video, the file is sent directly to Yandex Cloud S3 storage instead of being stored locally.

2. **Signed URLs**: When a user requests to view a video, a signed URL is generated that provides temporary access to the video file in S3. This URL expires after the time specified in `S3_PUBLIC_URL_EXPIRATION` (default: 1 hour).

3. **File Management**: When a video is deleted, the associated files in S3 (video file and thumbnail) are also deleted.

## Creating a Yandex Cloud S3 Bucket

1. Go to the [Yandex Cloud Console](https://console.cloud.yandex.com/)
2. Navigate to Object Storage
3. Click "Create Bucket"
4. Enter a unique name for your bucket
5. Select the appropriate region (usually `ru-central1`)
6. Configure access settings (public or private)
7. Click "Create"

## Creating Access Keys

1. Go to the [Yandex Cloud Console](https://console.cloud.yandex.com/)
2. Navigate to Service Accounts
3. Select or create a service account
4. Navigate to "Access Keys"
5. Click "Create Key"
6. Select "Static Key"
7. Save the access key ID and secret key securely

## CORS Configuration

If you plan to upload files directly from the frontend to S3, you'll need to configure CORS for your bucket:

1. Go to the bucket settings
2. Navigate to the CORS tab
3. Add a CORS rule like the following:

```json
[
  {
    "AllowedOrigins": ["http://localhost:5173", "https://your-production-domain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

Replace `https://your-production-domain.com` with your actual production domain.

## Testing the S3 Integration

To test if your S3 integration is working correctly:

1. Make sure your `.env` file is properly configured
2. Start the backend server
3. Upload a video through the frontend or API
4. Check if the video is stored in your S3 bucket
5. Try to view the video to see if the signed URL works correctly

## Troubleshooting

If you encounter issues with the S3 integration:

1. Check your environment variables to ensure they are correctly set
2. Verify that your access key and secret key are valid
3. Make sure your bucket exists and is accessible
4. Check the server logs for any error messages related to S3
5. Ensure your bucket has the correct permissions set