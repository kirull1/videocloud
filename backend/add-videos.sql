-- Insert more videos
INSERT INTO videos (
  id, title, description, user_id, file_path,
  thumbnail_path, duration, views, is_public,
  created_at, updated_at, category_id
)
VALUES
  (
    '44444444-dddd-4444-dddd-444444444444',
    'Introduction to NestJS',
    'Learn how to build scalable Node.js applications with NestJS framework',
    'a7bb7657-6f4c-482b-8608-17d8550c90c3',
    'nestjs-intro.mp4',
    'https://picsum.photos/seed/nestjs/640/360',
    2100,
    3200,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    '9bce6ab7-e707-45d6-816d-4c7e1413e618'  -- Education
  ),
  (
    '55555555-eeee-5555-eeee-555555555555',
    'React Hooks Deep Dive',
    'Master React Hooks with practical examples and best practices',
    'a7bb7657-6f4c-482b-8608-17d8550c90c3',
    'react-hooks.mp4',
    'https://picsum.photos/seed/react/640/360',
    1950,
    4100,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    '73662a00-07db-4110-81db-92e5133b039e'  -- Technology
  ),
  (
    '66666666-ffff-6666-ffff-666666666666',
    'Piano Basics for Beginners',
    'Start your piano journey with these essential lessons for beginners',
    '114f5a87-d378-476c-bea9-698c83ee3847',
    'piano-basics.mp4',
    'https://picsum.photos/seed/piano/640/360',
    2700,
    2800,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    '8ab26d47-b34b-4df1-9944-6453b14f08b9'  -- Music
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    'Minecraft Building Tips',
    'Advanced building techniques to take your Minecraft creations to the next level',
    'a7bb7657-6f4c-482b-8608-17d8550c90c3',
    'minecraft-tips.mp4',
    'https://picsum.photos/seed/minecraft/640/360',
    1800,
    5600,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    '5b0de136-1514-4045-bb65-2ccc85748dae'  -- Gaming
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    'Guitar Solo Techniques',
    'Learn advanced guitar solo techniques from a professional guitarist',
    '114f5a87-d378-476c-bea9-698c83ee3847',
    'guitar-solos.mp4',
    'https://picsum.photos/seed/guitar/640/360',
    2400,
    3900,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    '8ab26d47-b34b-4df1-9944-6453b14f08b9'  -- Music
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    'Data Structures and Algorithms',
    'Comprehensive guide to essential data structures and algorithms for coding interviews',
    'a7bb7657-6f4c-482b-8608-17d8550c90c3',
    'dsa-guide.mp4',
    'https://picsum.photos/seed/algorithms/640/360',
    3300,
    4700,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    '9bce6ab7-e707-45d6-816d-4c7e1413e618'  -- Education
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab',
    'Digital Art Fundamentals',
    'Learn the basics of digital art and illustration using Procreate',
    '114f5a87-d378-476c-bea9-698c83ee3847',
    'digital-art.mp4',
    'https://picsum.photos/seed/art/640/360',
    2850,
    3100,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    '875497d9-d70d-41bf-aafc-2435b41f000c'  -- Entertainment
  );

-- Insert video-tag relationships
INSERT INTO video_tags (video_id, tag_id)
VALUES
  ('44444444-dddd-4444-dddd-444444444444', '7eea068b-bee6-4e6e-a2ba-9a1a0a0e28dc'),  -- Tutorial
  ('55555555-eeee-5555-eeee-555555555555', '074d8dd5-65b6-4929-8d4f-ffea9b6b7547'),  -- Web Development
  ('66666666-ffff-6666-ffff-666666666666', '7eea068b-bee6-4e6e-a2ba-9a1a0a0e28dc'),  -- Tutorial
  ('77777777-7777-7777-7777-777777777777', '208c1258-bc51-452d-8e9a-40360c649945'),  -- Gameplay
  ('88888888-8888-8888-8888-888888888888', '7eea068b-bee6-4e6e-a2ba-9a1a0a0e28dc'),  -- Tutorial
  ('99999999-9999-9999-9999-999999999999', '7eea068b-bee6-4e6e-a2ba-9a1a0a0e28dc'),  -- Tutorial
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'ad462e6a-11a7-4c8d-b2f9-7511ffa88254');  -- How-to

-- Update tag usage counts
UPDATE tags
SET usage_count = usage_count + (
  SELECT COUNT(*)
  FROM video_tags
  WHERE tag_id = tags.id
  AND video_id IN (
    '44444444-dddd-4444-dddd-444444444444',
    '55555555-eeee-5555-eeee-555555555555',
    '66666666-ffff-6666-ffff-666666666666',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab'
  )
);