import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';

// Load environment variables
dotenv.config();

// Configuration
const API_URL = 'http://localhost:3001/api/users/avatar';
const TEST_AVATAR_PATH = path.join(__dirname, 'test-avatar.png');
const TEST_AVATAR_SIZE = 100 * 1024; // 100KB
const TOKEN = process.env.TEST_AUTH_TOKEN; // Add this to your .env file

// Create a test avatar file (a dummy PNG file)
function createTestAvatar() {
  console.log(`Creating test avatar file at ${TEST_AVATAR_PATH}`);
  const buffer = Buffer.alloc(TEST_AVATAR_SIZE);
  // Fill with random data to simulate an image file
  for (let i = 0; i < buffer.length; i += 4) {
    buffer.writeUInt32LE(Math.floor(Math.random() * 0xffffffff), i);
  }
  fs.writeFileSync(TEST_AVATAR_PATH, buffer);
  console.log(`Created test avatar file (${TEST_AVATAR_SIZE / 1024} KB)`);
}

// Upload the test avatar
async function uploadAvatar() {
  try {
    console.log('Preparing to upload test avatar...');

    // Create form data
    const formData = new FormData();
    formData.append('avatar', fs.createReadStream(TEST_AVATAR_PATH), {
      filename: 'test-avatar.png',
      contentType: 'image/png',
    });

    console.log('Uploading avatar...');

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

    // Check if the avatar was stored in S3
    if (response.data.avatarUrl && response.data.avatarUrl.includes('storage.yandexcloud.net')) {
      console.log('Avatar was successfully stored in S3 at URL:', response.data.avatarUrl);
    } else {
      console.warn('Avatar may not have been stored in S3. Check the response for details.');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error uploading avatar:');
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
  if (fs.existsSync(TEST_AVATAR_PATH)) {
    fs.unlinkSync(TEST_AVATAR_PATH);
    console.log(`Deleted test avatar file: ${TEST_AVATAR_PATH}`);
  }
}

// Main function
async function main() {
  try {
    createTestAvatar();
    await uploadAvatar();
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    cleanup();
  }
}

// Run the test
main();
