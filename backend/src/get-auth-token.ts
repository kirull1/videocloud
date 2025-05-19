import * as dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Configuration
const API_URL = 'http://localhost:3000/api/auth/login';
const TEST_USERNAME = process.env.TEST_USERNAME || 'testuser';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'password123';

async function getAuthToken() {
  try {
    console.log(`Attempting to login as ${TEST_USERNAME}...`);

    const response = await axios.post(API_URL, {
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    });

    const { accessToken } = response.data;

    if (accessToken) {
      console.log('Authentication successful!');
      console.log('Access Token:', accessToken);
      console.log('\nAdd this token to your .env file as:');
      console.log(`TEST_AUTH_TOKEN=${accessToken}`);

      return accessToken;
    } else {
      console.error('No access token received in the response');
      console.error('Response:', response.data);
      return null;
    }
  } catch (error: any) {
    console.error('Authentication failed:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
    return null;
  }
}

// Run the script
getAuthToken();
