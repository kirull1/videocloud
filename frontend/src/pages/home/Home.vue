<script setup lang="ts">
import Header from '@/widgets/header'
</script>

<template>
  <main>
    <Header />
    <div class="container">
      <h1 class="page-title">Discover Videos</h1>
      
      <div class="video-grid">
        <!-- Video 1 -->
        <div class="video-card">
          <div class="thumbnail">
            <img src="https://picsum.photos/seed/video1/640/360" alt="Video thumbnail"/>
            <div class="duration">3:30</div>
          </div>
          <div class="video-info">
            <h3 class="video-title">Introduction to NestJS</h3>
            <p class="channel-name">testuser</p>
            <p class="video-meta">3.2K views • 2 days ago</p>
          </div>
        </div>
        
        <!-- Video 2 -->
        <div class="video-card">
          <div class="thumbnail">
            <img src="https://picsum.photos/seed/video2/640/360" alt="Video thumbnail"/>
            <div class="duration">4:15</div>
          </div>
          <div class="video-info">
            <h3 class="video-title">React Hooks Deep Dive</h3>
            <p class="channel-name">testuser</p>
            <p class="video-meta">4.1K views • 3 days ago</p>
          </div>
        </div>
        
        <!-- Video 3 -->
        <div class="video-card">
          <div class="thumbnail">
            <img src="https://picsum.photos/seed/video3/640/360" alt="Video thumbnail"/>
            <div class="duration">5:45</div>
          </div>
          <div class="video-info">
            <h3 class="video-title">Piano Basics for Beginners</h3>
            <p class="channel-name">kirull1</p>
            <p class="video-meta">2.8K views • 1 week ago</p>
          </div>
        </div>
        
        <!-- Video 4 -->
        <div class="video-card">
          <div class="thumbnail">
            <img src="https://picsum.photos/seed/video4/640/360" alt="Video thumbnail"/>
            <div class="duration">3:00</div>
          </div>
          <div class="video-info">
            <h3 class="video-title">Minecraft Building Tips</h3>
            <p class="channel-name">testuser</p>
            <p class="video-meta">5.6K views • 5 days ago</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--text-primary, #1A202C);
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.video-card {
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 8px;
  overflow: hidden;
}

.video-card:hover {
  transform: translateY(-4px);
}

.thumbnail {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
}

.thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 12px;
}

.video-info {
  padding: 12px;
}

.video-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.channel-name {
  margin: 0 0 4px;
  font-size: 14px;
  color: #666;
}

.video-meta {
  margin: 0;
  font-size: 12px;
  color: #888;
}

@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 480px) {
  .video-grid {
    grid-template-columns: 1fr;
  }
}
</style>
