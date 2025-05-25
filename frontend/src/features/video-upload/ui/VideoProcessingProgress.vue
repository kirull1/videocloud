<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { appConfig } from '@/shared/config/app.config';

const props = defineProps({
  videoId: {
    type: String,
    required: true
  }
});

const router = useRouter();
const progress = ref(0);
const stage = ref('uploading');
const message = ref('Starting video processing...');
const error = ref('');
const completed = ref(false);
const eventSource = ref<EventSource | null>(null);

// Connect to SSE endpoint for real-time progress updates
const connectToEventSource = () => {
  // Close any existing connection
  if (eventSource.value) {
    eventSource.value.close();
  }

  try {
    // Check if EventSource is supported by the browser
    if (typeof EventSource === 'undefined') {
      console.warn('EventSource is not supported in this browser. Falling back to polling.');
      error.value = 'Real-time updates not supported in this browser. Using polling instead.';
      pollProgressStatus();
      return;
    }
    
    // Create a new EventSource connection
    // Use the correct API URL from the app config
    const url = `${appConfig.apiUrl}/videos/${props.videoId}/progress`;
    eventSource.value = new EventSource(url);

    // Handle incoming messages
    eventSource.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        progress.value = data.progress;
        stage.value = data.stage;
        message.value = data.message || getDefaultMessageForStage(data.stage);
        
        if (data.error) {
          error.value = data.error;
        }
        
        // If processing is completed, close the connection and navigate to video page
        if (data.stage === 'completed') {
          completed.value = true;
          closeEventSource();
          // Automatically navigate to the video page
          goToVideo();
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err);
      }
    };

    // Handle errors
    eventSource.value.onerror = (err) => {
      console.error('SSE connection error:', err);
      
      // Check if this might be a CORS issue
      const corsError = 'This could be due to CORS restrictions or the server being unavailable.';
      error.value = `Connection error. ${corsError} Falling back to polling.`;
      
      closeEventSource();
      
      // Fall back to polling instead of reconnecting SSE
      pollProgressStatus();
    };
  } catch (err) {
    console.error('Error creating EventSource:', err);
    error.value = 'Failed to connect to server. Please refresh the page to try again.';
    
    // Fallback to polling if EventSource fails
    pollProgressStatus();
  }
};

// Fallback polling method if SSE fails
const pollProgressStatus = () => {
  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`${appConfig.apiUrl}/videos/${props.videoId}/progress-status`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      progress.value = data.progress;
      stage.value = data.stage;
      message.value = data.message || getDefaultMessageForStage(data.stage);
      
      if (data.error) {
        error.value = data.error;
      }
      
      // If processing is completed or failed, stop polling
      if (data.stage === 'completed' || data.stage === 'failed') {
        completed.value = data.stage === 'completed';
        clearInterval(pollInterval);
        
        // If completed, automatically navigate to the video page
        if (data.stage === 'completed') {
          goToVideo();
        }
      }
    } catch (err) {
      console.error('Error polling progress status:', err);
      // Don't set error here to avoid overriding existing error messages
      clearInterval(pollInterval);
    }
  }, 3000); // Poll every 3 seconds
  
  // Clean up interval on component unmount
  onUnmounted(() => {
    clearInterval(pollInterval);
  });
};

// Close the EventSource connection
const closeEventSource = () => {
  if (eventSource.value) {
    eventSource.value.close();
    eventSource.value = null;
  }
};

// Get a default message for each processing stage
const getDefaultMessageForStage = (stage: string): string => {
  switch (stage) {
    case 'uploading':
      return 'Uploading your video...';
    case 'analyzing':
      return 'Analyzing video content...';
    case 'transcoding':
      return 'Converting video to different formats...';
    case 'generating_thumbnails':
      return 'Creating thumbnails from your video...';
    case 'finalizing':
      return 'Finalizing your video...';
    case 'completed':
      return 'Video processing completed!';
    case 'failed':
      return 'Video processing failed.';
    default:
      return 'Processing your video...';
  }
};

// Get the stage icon
const getStageIcon = (stage: string): string => {
  switch (stage) {
    case 'uploading':
      return '📤';
    case 'analyzing':
      return '🔍';
    case 'transcoding':
      return '🔄';
    case 'generating_thumbnails':
      return '🖼️';
    case 'finalizing':
      return '📋';
    case 'completed':
      return '✅';
    case 'failed':
      return '❌';
    default:
      return '⏳';
  }
};

// Navigate to the video page when processing is complete with a full page reload
const goToVideo = () => {
  // Use window.location.href instead of router.push to force a full page reload
  window.location.href = `/videos/watch?id=${props.videoId}`;
};

// Connect to the event source when the component is mounted
onMounted(() => {
  connectToEventSource();
});

// Close the event source when the component is unmounted
onUnmounted(() => {
  closeEventSource();
});
</script>

<template>
  <div class="video-processing-progress">
    <h2 class="progress-title">
      <span v-if="completed">Video Processing Complete</span>
      <span v-else-if="error">Video Processing Failed</span>
      <span v-else>Processing Your Video</span>
    </h2>
    
    <div v-if="error" class="error-message">
      <div class="error-icon">❌</div>
      <p>{{ error }}</p>
      <p class="error-info">Don't worry, your video is still being processed. We're using an alternative method to track progress.</p>
      <button class="retry-button" @click="connectToEventSource">
        Try Real-time Updates Again
      </button>
    </div>
    
    <div v-else class="progress-container">
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: `${progress}%` }"/>
      </div>
      
      <div class="progress-details">
        <div class="progress-percentage">{{ progress }}%</div>
        <div class="progress-stage">
          <span class="stage-icon">{{ getStageIcon(stage) }}</span>
          <span class="stage-name">{{ stage.replace('_', ' ') }}</span>
        </div>
      </div>
      
      <p class="progress-message">{{ message }}</p>
    </div>
  </div>
</template>

<style scoped>
.video-processing-progress {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
  color: var(--text-primary, #1A2233);
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-bar-container {
  height: 8px;
  background-color: rgba(65, 164, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: var(--primary, #41A4FF);
  transition: width 0.3s ease;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-percentage {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary, #41A4FF);
}

.progress-stage {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stage-icon {
  font-size: 20px;
}

.stage-name {
  font-size: 16px;
  color: var(--text-secondary, #67748B);
  text-transform: capitalize;
}

.progress-message {
  font-size: 14px;
  color: var(--text-secondary, #67748B);
  text-align: center;
  margin: 8px 0;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: rgba(255, 103, 123, 0.1);
  border-radius: 8px;
  color: var(--error, #FF677B);
}

.error-icon {
  font-size: 32px;
}

.error-info {
  font-size: 14px;
  color: rgba(255, 103, 123, 0.8);
  margin-top: 8px;
  font-style: italic;
}

.retry-button {
  margin-top: 8px;
  padding: 8px 16px;
  background-color: var(--primary, #41A4FF);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #3490e6;
}


@media (max-width: 768px) {
  .video-processing-progress {
    padding: 16px;
  }
  
  .progress-title {
    font-size: 20px;
  }
}
</style>