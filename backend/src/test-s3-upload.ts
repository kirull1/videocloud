import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// S3 configuration
const s3Config = {
  region: process.env.YANDEX_CLOUD_REGION || 'ru-central1',
  endpoint: process.env.YANDEX_CLOUD_S3_ENDPOINT || 'https://storage.yandexcloud.net',
  credentials: {
    accessKeyId: process.env.YANDEX_CLOUD_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.YANDEX_CLOUD_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true, // Needed for Yandex Cloud S3
};

const bucketName = process.env.YANDEX_CLOUD_S3_BUCKET || 'videocloud-bucket';
const userId = 'test-user-id';
const videoFileName = 'test-video.mp4';
const videoFilePath = path.join(__dirname, videoFileName);
const videoFileSize = 1024 * 1024; // 1MB

// Initialize S3 client
const s3Client = new S3Client(s3Config);

// Create a test video file
function createTestVideo() {
  console.log(`Creating test video file at ${videoFilePath}`);
  const buffer = Buffer.alloc(videoFileSize);
  // Fill with random data to simulate a video file
  for (let i = 0; i < buffer.length; i += 4) {
    buffer.writeUInt32LE(Math.floor(Math.random() * 0xffffffff), i);
  }
  fs.writeFileSync(videoFilePath, buffer);
  console.log(`Created test video file (${videoFileSize / 1024 / 1024} MB)`);
  return buffer;
}

// Upload the test video to S3
async function uploadVideoToS3(buffer: Buffer) {
  try {
    console.log('Uploading video to S3...');

    // Generate a unique key for the video
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const key = `videos/${userId}/${timestamp}-${randomString}.mp4`;

    // Upload the video
    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'video/mp4',
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    console.log(`Video uploaded successfully to ${bucketName}/${key}`);

    // Generate a signed URL for the video
    const command = new PutObjectCommand(uploadParams);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log('Signed URL for accessing the video:', signedUrl);

    return key;
  } catch (error: any) {
    console.error('Error uploading video to S3:', error.message);
    throw error;
  }
}

// Clean up
function cleanup() {
  console.log('Cleaning up...');
  if (fs.existsSync(videoFilePath)) {
    fs.unlinkSync(videoFilePath);
    console.log(`Deleted test video file: ${videoFilePath}`);
  }
}

// Main function
async function main() {
  try {
    const videoBuffer = createTestVideo();
    const videoKey = await uploadVideoToS3(videoBuffer);
    console.log('S3 upload test completed successfully!');
    console.log('Video key:', videoKey);
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    cleanup();
  }
}

// Run the test
main();
