import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMoreVideos1716042500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create more videos
    const videos = [
      {
        id: '44444444-dddd-4444-dddd-444444444444',
        title: 'Introduction to NestJS',
        description: 'Learn how to build scalable Node.js applications with NestJS framework',
        status: 'ready',
        visibility: 'public',
        filename: 'nestjs-intro.mp4',
        duration: 2100,
        thumbnailUrl: 'https://picsum.photos/seed/nestjs/640/360',
        fileSize: 128000000,
        views: 3200,
        userId: '11111111-1111-1111-1111-111111111111',
        categoryId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      },
      {
        id: '55555555-eeee-5555-eeee-555555555555',
        title: 'React Hooks Deep Dive',
        description: 'Master React Hooks with practical examples and best practices',
        status: 'ready',
        visibility: 'public',
        filename: 'react-hooks.mp4',
        duration: 1950,
        thumbnailUrl: 'https://picsum.photos/seed/react/640/360',
        fileSize: 115000000,
        views: 4100,
        userId: '22222222-2222-2222-2222-222222222222',
        categoryId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      },
      {
        id: '66666666-ffff-6666-ffff-666666666666',
        title: 'Piano Basics for Beginners',
        description: 'Start your piano journey with these essential lessons for beginners',
        status: 'ready',
        visibility: 'public',
        filename: 'piano-basics.mp4',
        duration: 2700,
        thumbnailUrl: 'https://picsum.photos/seed/piano/640/360',
        fileSize: 165000000,
        views: 2800,
        userId: '33333333-3333-3333-3333-333333333333',
        categoryId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      },
      {
        id: '77777777-gggg-7777-gggg-777777777777',
        title: 'Minecraft Building Tips',
        description:
          'Advanced building techniques to take your Minecraft creations to the next level',
        status: 'ready',
        visibility: 'public',
        filename: 'minecraft-tips.mp4',
        duration: 1800,
        thumbnailUrl: 'https://picsum.photos/seed/minecraft/640/360',
        fileSize: 98000000,
        views: 5600,
        userId: '11111111-1111-1111-1111-111111111111',
        categoryId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      },
      {
        id: '88888888-hhhh-8888-hhhh-888888888888',
        title: 'Guitar Solo Techniques',
        description: 'Learn advanced guitar solo techniques from a professional guitarist',
        status: 'ready',
        visibility: 'public',
        filename: 'guitar-solos.mp4',
        duration: 2400,
        thumbnailUrl: 'https://picsum.photos/seed/guitar/640/360',
        fileSize: 142000000,
        views: 3900,
        userId: '22222222-2222-2222-2222-222222222222',
        categoryId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      },
      {
        id: '99999999-iiii-9999-iiii-999999999999',
        title: 'Data Structures and Algorithms',
        description:
          'Comprehensive guide to essential data structures and algorithms for coding interviews',
        status: 'ready',
        visibility: 'public',
        filename: 'dsa-guide.mp4',
        duration: 3300,
        thumbnailUrl: 'https://picsum.photos/seed/algorithms/640/360',
        fileSize: 187000000,
        views: 4700,
        userId: '33333333-3333-3333-3333-333333333333',
        categoryId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      },
      {
        id: 'aaaaaaaa-jjjj-aaaa-jjjj-aaaaaaaaaaaa',
        title: 'Digital Art Fundamentals',
        description: 'Learn the basics of digital art and illustration using Procreate',
        status: 'ready',
        visibility: 'public',
        filename: 'digital-art.mp4',
        duration: 2850,
        thumbnailUrl: 'https://picsum.photos/seed/art/640/360',
        fileSize: 168000000,
        views: 3100,
        userId: '11111111-1111-1111-1111-111111111111',
        categoryId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      },
    ];

    // Insert videos
    for (const video of videos) {
      await queryRunner.query(`
        INSERT INTO videos (
          id, title, description, status, visibility, filename,
          duration, "thumbnailUrl", "fileSize", views, "userId",
          "categoryId", "createdAt", "updatedAt"
        )
        VALUES (
          '${video.id}',
          '${video.title}',
          '${video.description}',
          '${video.status}',
          '${video.visibility}',
          '${video.filename}',
          ${video.duration},
          ${video.thumbnailUrl ? `'${video.thumbnailUrl}'` : 'NULL'},
          ${video.fileSize},
          ${video.views},
          '${video.userId}',
          '${video.categoryId}',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `);
    }

    // Create video-tag relationships
    const videoTags = [
      {
        videoId: '44444444-dddd-4444-dddd-444444444444',
        tagId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      },
      {
        videoId: '55555555-eeee-5555-eeee-555555555555',
        tagId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      },
      {
        videoId: '66666666-ffff-6666-ffff-666666666666',
        tagId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      },
      {
        videoId: '77777777-gggg-7777-gggg-777777777777',
        tagId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      },
      {
        videoId: '88888888-hhhh-8888-hhhh-888888888888',
        tagId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      },
      {
        videoId: '99999999-iiii-9999-iiii-999999999999',
        tagId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      },
      {
        videoId: 'aaaaaaaa-jjjj-aaaa-jjjj-aaaaaaaaaaaa',
        tagId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      },
    ];

    // Insert video-tag relationships
    for (const videoTag of videoTags) {
      await queryRunner.query(`
        INSERT INTO video_tags ("videoId", "tagId")
        VALUES (
          '${videoTag.videoId}',
          '${videoTag.tagId}'
        )
      `);

      // Update tag usage count
      await queryRunner.query(`
        UPDATE tags
        SET "usageCount" = "usageCount" + 1
        WHERE id = '${videoTag.tagId}'
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete video-tag relationships for the new videos
    await queryRunner.query(`
      DELETE FROM video_tags 
      WHERE "videoId" IN (
        '44444444-dddd-4444-dddd-444444444444',
        '55555555-eeee-5555-eeee-555555555555',
        '66666666-ffff-6666-ffff-666666666666',
        '77777777-gggg-7777-gggg-777777777777',
        '88888888-hhhh-8888-hhhh-888888888888',
        '99999999-iiii-9999-iiii-999999999999',
        'aaaaaaaa-jjjj-aaaa-jjjj-aaaaaaaaaaaa'
      )
    `);

    // Delete the new videos
    await queryRunner.query(`
      DELETE FROM videos 
      WHERE id IN (
        '44444444-dddd-4444-dddd-444444444444',
        '55555555-eeee-5555-eeee-555555555555',
        '66666666-ffff-6666-ffff-666666666666',
        '77777777-gggg-7777-gggg-777777777777',
        '88888888-hhhh-8888-hhhh-888888888888',
        '99999999-iiii-9999-iiii-999999999999',
        'aaaaaaaa-jjjj-aaaa-jjjj-aaaaaaaaaaaa'
      )
    `);

    // Reset tag usage counts
    await queryRunner.query(`
      UPDATE tags
      SET "usageCount" = "usageCount" - (
        SELECT COUNT(*)
        FROM video_tags
        WHERE "tagId" = tags.id
        AND "videoId" IN (
          '44444444-dddd-4444-dddd-444444444444',
          '55555555-eeee-5555-eeee-555555555555',
          '66666666-ffff-6666-ffff-666666666666',
          '77777777-gggg-7777-gggg-777777777777',
          '88888888-hhhh-8888-hhhh-888888888888',
          '99999999-iiii-9999-iiii-999999999999',
          'aaaaaaaa-jjjj-aaaa-jjjj-aaaaaaaaaaaa'
        )
      )
    `);
  }
}
