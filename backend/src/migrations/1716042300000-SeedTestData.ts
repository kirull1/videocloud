import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedTestData1716042300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create test users
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: passwordHash,
        isEmailVerified: true,
        avatarUrl: null,
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'jane.smith@example.com',
        username: 'janesmith',
        password: passwordHash,
        isEmailVerified: true,
        avatarUrl: null,
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'bob.wilson@example.com',
        username: 'bobwilson',
        password: passwordHash,
        isEmailVerified: false,
        avatarUrl: null,
      },
    ];

    // Insert users
    for (const user of users) {
      await queryRunner.query(`
        INSERT INTO users (id, email, username, password, "isEmailVerified", "avatarUrl", "createdAt", "updatedAt")
        VALUES (
          '${user.id}',
          '${user.email}',
          '${user.username}',
          '${user.password}',
          ${user.isEmailVerified},
          ${user.avatarUrl ? `'${user.avatarUrl}'` : 'NULL'},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `);
    }

    // Create categories
    const categories = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Gaming',
        slug: 'gaming',
        description: 'Video game content and gameplay',
        iconUrl: null,
        order: 1,
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Music',
        slug: 'music',
        description: 'Music videos and performances',
        iconUrl: null,
        order: 2,
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        name: 'Education',
        slug: 'education',
        description: 'Educational content and tutorials',
        iconUrl: null,
        order: 3,
      },
    ];

    // Insert categories
    for (const category of categories) {
      await queryRunner.query(`
        INSERT INTO categories (id, name, slug, description, "iconUrl", "order", "createdAt", "updatedAt")
        VALUES (
          '${category.id}',
          '${category.name}',
          '${category.slug}',
          '${category.description}',
          ${category.iconUrl ? `'${category.iconUrl}'` : 'NULL'},
          ${category.order},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `);
    }

    // Create tags
    const tags = [
      {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        name: 'Tutorial',
        slug: 'tutorial',
        usageCount: 0,
      },
      {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        name: 'Review',
        slug: 'review',
        usageCount: 0,
      },
      {
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        name: 'Live Stream',
        slug: 'live-stream',
        usageCount: 0,
      },
    ];

    // Insert tags
    for (const tag of tags) {
      await queryRunner.query(`
        INSERT INTO tags (id, name, slug, "usageCount", "createdAt", "updatedAt")
        VALUES (
          '${tag.id}',
          '${tag.name}',
          '${tag.slug}',
          ${tag.usageCount},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `);
    }

    // Create videos
    const videos = [
      {
        id: '11111111-aaaa-1111-aaaa-111111111111',
        title: 'Getting Started with TypeScript',
        description: 'Learn the basics of TypeScript in this comprehensive tutorial',
        status: 'ready',
        visibility: 'public',
        filename: 'typescript-tutorial.mp4',
        duration: 1800,
        thumbnailUrl: null,
        fileSize: 102400000,
        views: 1500,
        userId: '11111111-1111-1111-1111-111111111111',
        categoryId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      },
      {
        id: '22222222-bbbb-2222-bbbb-222222222222',
        title: 'Vue.js Best Practices',
        description: 'Advanced tips and tricks for Vue.js development',
        status: 'ready',
        visibility: 'public',
        filename: 'vue-best-practices.mp4',
        duration: 2400,
        thumbnailUrl: null,
        fileSize: 153600000,
        views: 2300,
        userId: '22222222-2222-2222-2222-222222222222',
        categoryId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      },
      {
        id: '33333333-cccc-3333-cccc-333333333333',
        title: 'Game Development with Unity',
        description: 'Create your first game using Unity game engine',
        status: 'ready',
        visibility: 'public',
        filename: 'unity-game-dev.mp4',
        duration: 3600,
        thumbnailUrl: null,
        fileSize: 204800000,
        views: 4500,
        userId: '33333333-3333-3333-3333-333333333333',
        categoryId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
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
      { videoId: '11111111-aaaa-1111-aaaa-111111111111', tagId: 'dddddddd-dddd-dddd-dddd-dddddddddddd' },
      { videoId: '22222222-bbbb-2222-bbbb-222222222222', tagId: 'dddddddd-dddd-dddd-dddd-dddddddddddd' },
      { videoId: '33333333-cccc-3333-cccc-333333333333', tagId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' },
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
    // Delete video-tag relationships
    await queryRunner.query(`DELETE FROM video_tags`);

    // Delete videos
    await queryRunner.query(`DELETE FROM videos`);

    // Delete tags
    await queryRunner.query(`DELETE FROM tags`);

    // Delete categories
    await queryRunner.query(`DELETE FROM categories`);

    // Delete users
    await queryRunner.query(`DELETE FROM users`);
  }
} 