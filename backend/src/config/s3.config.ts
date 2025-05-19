import { registerAs } from '@nestjs/config';

export default registerAs('s3', () => ({
  region: process.env.YANDEX_CLOUD_REGION || 'ru-central1',
  endpoint: process.env.YANDEX_CLOUD_S3_ENDPOINT || 'https://storage.yandexcloud.net',
  bucket: process.env.YANDEX_CLOUD_S3_BUCKET || 'videocloud-bucket',
  accessKeyId: process.env.YANDEX_CLOUD_ACCESS_KEY_ID,
  secretAccessKey: process.env.YANDEX_CLOUD_SECRET_ACCESS_KEY,
  publicUrlExpiration: parseInt(process.env.S3_PUBLIC_URL_EXPIRATION || '3600', 10), // 1 hour by default
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB by default
  allowedVideoMimeTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  allowedImageMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  videoFolder: 'videos/',
  thumbnailFolder: 'thumbnails/',
  avatarFolder: 'avatars/',
}));
