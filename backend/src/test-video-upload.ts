import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';

// Load environment variables
dotenv.config();

// Configuration
const API_URL = 'http://localhost:3001/api/videos'; // Updated port to 3001
const TEST_VIDEO_PATH = path.join(__dirname, 'test-video.mp4');
const TEST_VIDEO_SIZE = 1024 * 1024; // 1MB
const TOKEN = process.env.TEST_AUTH_TOKEN; // Add this to your .env file

// Create a test video file (a dummy MP4 file)
function createTestVideo() {
  console.log(`Creating test video file at ${TEST_VIDEO_PATH}`);
  const buffer = Buffer.alloc(TEST_VIDEO_SIZE);
  // Fill with random data to simulate a video file
  for (let i = 0; i < buffer.length; i += 4) {
    buffer.writeUInt32LE(Math.floor(Math.random() * 0xffffffff), i);
  }
  fs.writeFileSync(TEST_VIDEO_PATH, buffer);
  console.log(`Created test video file (${TEST_VIDEO_SIZE / 1024 / 1024} MB)`);
}

// Upload the test video
async function uploadVideo() {
  try {
    console.log('Preparing to upload test video...');

    // Create form data
    const formData = new FormData();
    formData.append('title', 'Test Video Upload');
    formData.append(
      'description',
      'This is a test video uploaded via the API to test S3 integration',
    );
    formData.append('visibility', 'public');
    formData.append('file', fs.createReadStream(TEST_VIDEO_PATH), {
      filename: 'test-video.mp4',
      contentType: 'video/mp4',
    });

    console.log('Uploading video...');

    // Set headers
    const headers: any = {
      ...formData.getHeaders(),
    };

    // Add authorization token if available
    if (TOKEN) {
      headers['Authorization'] = `Bearer ${TOKEN}`;
      console.log('Using authentication token');

      // Debug: Print token (masked)
      const maskedToken = TOKEN.substring(0, 10) + '...' + TOKEN.substring(TOKEN.length - 10);
      console.log(`Token: ${maskedToken}`);
    } else {
      console.warn(
        'No authentication token provided. Upload may fail if authentication is required.',
      );
    }

    // Make the request
    console.log('Sending request to:', API_URL);
    const response = await axios.post(API_URL, formData, {
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log('Upload successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    // Check if the video was stored in S3
    if (response.data.filePath && response.data.filePath.includes('videos/')) {
      console.log('Video was successfully stored in S3 at path:', response.data.filePath);
    } else {
      console.warn('Video may not have been stored in S3. Check the response for details.');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error uploading video:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);

      // Check for specific error cases
      if (error.response.status === 401) {
        console.error('Authentication failed. Please check your token.');
      } else if (error.response.status === 413) {
        console.error('File too large. The server rejected the upload.');
      }
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Clean up
function cleanup() {
  console.log('Cleaning up...');
  if (fs.existsSync(TEST_VIDEO_PATH)) {
    fs.unlinkSync(TEST_VIDEO_PATH);
    console.log(`Deleted test video file: ${TEST_VIDEO_PATH}`);
  }
}

// Main function
async function main() {
  try {
    createTestVideo();
    await uploadVideo();
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    cleanup();
  }
}

// Run the test
main();
