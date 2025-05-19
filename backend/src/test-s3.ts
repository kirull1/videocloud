import {
  S3Client,
  ListBucketsCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
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
const testFileName = 'test-file.txt';
const testFilePath = path.join(__dirname, testFileName);
const testFileContent = 'This is a test file for S3 integration.';

// Create a test file
fs.writeFileSync(testFilePath, testFileContent);

// Initialize S3 client
const s3Client = new S3Client(s3Config);

async function testS3Integration() {
  console.log('Starting S3 integration test...');
  console.log('S3 Configuration:', {
    region: s3Config.region,
    endpoint: s3Config.endpoint,
    bucket: bucketName,
    accessKeyId: s3Config.credentials.accessKeyId ? '***' : 'Not set',
    secretAccessKey: s3Config.credentials.secretAccessKey ? '***' : 'Not set',
  });

  try {
    // Test 1: List buckets
    console.log('\nTest 1: Listing buckets...');
    const listBucketsResponse = await s3Client.send(new ListBucketsCommand({}));
    console.log('Buckets:', listBucketsResponse.Buckets?.map((bucket) => bucket.Name).join(', '));

    // Test 2: Upload a file
    console.log('\nTest 2: Uploading a file...');
    const fileBuffer = fs.readFileSync(testFilePath);
    const uploadParams = {
      Bucket: bucketName,
      Key: `test/${testFileName}`,
      Body: fileBuffer,
      ContentType: 'text/plain',
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    console.log(`File uploaded successfully to ${bucketName}/test/${testFileName}`);

    // Test 3: Generate a signed URL
    console.log('\nTest 3: Generating a signed URL...');
    const getObjectParams = {
      Bucket: bucketName,
      Key: `test/${testFileName}`,
    };
    const command = new GetObjectCommand(getObjectParams);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log('Signed URL:', signedUrl);
    console.log('You can access the file using this URL for the next hour.');

    // Test 4: Delete the file
    console.log('\nTest 4: Deleting the file...');
    const deleteParams = {
      Bucket: bucketName,
      Key: `test/${testFileName}`,
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));
    console.log(`File deleted successfully from ${bucketName}/test/${testFileName}`);

    console.log('\nS3 integration test completed successfully!');
  } catch (error) {
    console.error('Error during S3 integration test:', error);
  } finally {
    // Clean up the local test file
    fs.unlinkSync(testFilePath);
    console.log(`Local test file ${testFilePath} deleted.`);
  }
}

// Run the test
testS3Integration();
